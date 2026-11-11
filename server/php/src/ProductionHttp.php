<?php
declare(strict_types=1);

namespace Esi\Admin;

use Throwable;

require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/ProjectRepository.php';

/** Public Hosting entry point. Development bridge endpoints are never exposed here. */
function handleProductionHttp(): never
{
    ini_set('display_errors', '0');
    umask(0077);
    header_remove('X-Powered-By');
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $authRoutes = ['/api/admin/auth/session', '/api/admin/auth/login', '/api/admin/auth/logout'];
    $operations = ['save', 'publish', 'remove', 'unpublish', 'migrate'];
    $operation = is_string($path) && str_starts_with($path, '/api/admin/projects/') ? substr($path, strlen('/api/admin/projects/')) : '';
    if (!in_array($path, [...$authRoutes, '/api/admin/audit-logs', '/api/admin/projects', '/api/admin/traffic', '/api/projects', '/sitemap.xml'], true)
        && !in_array($operation, $operations, true)) sendJson(404, ['error' => 'NOT_FOUND']);
    if (in_array($path, $authRoutes, true)) handleAuthHttp();
    $expectedMethod = in_array($operation, $operations, true) ? 'POST' : 'GET';
    if ($method !== $expectedMethod) {
        header('Allow: ' . $expectedMethod);
        sendJson(405, ['error' => 'METHOD_NOT_ALLOWED']);
    }
    $repository = null; $session = null; $audit = null;
    try {
        $config = loadConfig();
        if ($config['environment'] === 'production' && ($_SERVER['HTTPS'] ?? '') !== 'on') throw new AuthError('FORBIDDEN', 403);
        if ($config['environment'] === 'development' && !isLoopback($_SERVER['REMOTE_ADDR'] ?? '')) throw new AuthError('FORBIDDEN', 403);
        $repository = new ProjectRepository($config);
        if ($path === '/api/projects') sendJson(200, ['projects' => $repository->published()]);
        if ($path === '/sitemap.xml') {
            $seed = json_decode(file_get_contents(__DIR__ . '/../seed.json'), true, 64, JSON_THROW_ON_ERROR);
            $xml = $seed['sitemapBase'];
            $entries = '';
            foreach ($repository->published() as $project) {
                $url = htmlspecialchars($seed['siteUrl'] . '/projects/' . $project['slug'], ENT_XML1 | ENT_QUOTES, 'UTF-8');
                $entries .= "  <url><loc>" . $url . "</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n";
            }
            header('Content-Type: application/xml; charset=utf-8');
            echo str_replace('</urlset>', $entries . '</urlset>', $xml);
            exit;
        }
        $pdo = connectDatabase($config);
        $audit = new MysqlAuditLog($pdo);
        $service = new AuthService(new MysqlAuthStore($pdo), new RateLimiter($config['private_directory'], $config['internal_key']), $config);
        $session = $service->session(cookieValue($config['cookie_name']));
        if ($session === null) throw new AuthError('AUTH_REQUIRED', 401);
        requireOrigin($config, $_SERVER['HTTP_ORIGIN'] ?? null, $method === 'POST');
        if ($method === 'POST') requireCsrf($session['csrfToken'], $_SERVER['HTTP_X_ESI_CSRF'] ?? null);
        try { $repository->flush($audit); } catch (Throwable) { error_log('ESI audit delivery deferred'); }
        if ($path === '/api/admin/audit-logs') {
            if ($session['user']['role'] !== 'admin') throw new AuthError('FORBIDDEN', 403);
            sendJson(200, $audit->listEvents($_GET));
        }
        if ($path === '/api/admin/traffic') {
            $file = dirname(adminPublicDirectory()) . '/.esi-visitor-count/count.json';
            $state = is_file($file) ? json_decode(file_get_contents($file), true, 16, JSON_THROW_ON_ERROR) : ['total' => 0];
            if (!is_int($state['total'] ?? null) || $state['total'] < 0) throw new ProjectError('TRAFFIC_UNAVAILABLE', 503);
            sendJson(200, ['views' => $state['total']]);
        }
        if ($path === '/api/admin/projects') sendJson(200, $repository->get());
        if (($_SERVER['HTTP_X_ESI_ADMIN'] ?? '') !== '1' || !str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) throw new AuthError('FORBIDDEN', 403);
        $max = 16 * 1024 * 1024;
        if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > $max) throw new ProjectError('TOO_LARGE', 413);
        $contents = file_get_contents('php://input', false, null, 0, $max + 1);
        if ($contents === false || strlen($contents) > $max) throw new ProjectError('TOO_LARGE', 413);
        try { $body = json_decode($contents, true, 32, JSON_THROW_ON_ERROR); }
        catch (Throwable) { throw new ProjectError('INVALID_PROJECT'); }
        if (!is_array($body) || array_is_list($body)) throw new ProjectError('INVALID_PROJECT');
        $result = $repository->mutate($operation, $body, $session['user']['id']);
        try { $repository->flush($audit); } catch (Throwable) { error_log('ESI audit delivery deferred'); }
        sendJson(200, $result);
    } catch (AuthError|AuditError|ProjectError $error) {
        if ($error instanceof ProjectError && $session !== null && $repository !== null && in_array($operation, $operations, true)) {
            try {
                $action = match ($operation) { 'save', 'migrate' => 'save_draft', 'remove' => 'delete', default => $operation };
                $repository->failure($session['user']['id'], $action, $error->errorCode);
                if ($audit !== null) $repository->flush($audit);
            } catch (Throwable) { error_log('ESI audit delivery deferred'); }
        }
        sendJson($error->status, ['error' => $error->errorCode]);
    } catch (Throwable $error) {
        error_log('ESI production API unavailable (' . get_class($error) . ')');
        sendJson(503, ['error' => 'CONFIGURATION_ERROR']);
    }
}
