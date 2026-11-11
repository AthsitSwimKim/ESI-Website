<?php
declare(strict_types=1);

namespace Esi\Admin;

use JsonException;
use Throwable;

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Store.php';
require_once __DIR__ . '/RateLimiter.php';
require_once __DIR__ . '/AuthService.php';

function sendJson(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function cookieValue(string $name): ?string
{
    return isset($_COOKIE[$name]) && is_string($_COOKIE[$name]) ? $_COOKIE[$name] : null;
}

function setAuthCookie(array $config, string $name, string $value, int $expires, string $path): void
{
    setcookie($name, $value, [
        'expires' => $expires,
        'path' => $path,
        'secure' => $config['cookie_secure'],
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

function requireOrigin(array $config, ?string $origin, bool $required): void
{
    if (($required && $origin === null) || ($origin !== null && !in_array($origin, $config['allowed_origins'], true))) {
        throw new AuthError('FORBIDDEN', 403);
    }
}

function requireCsrf(?string $expected, ?string $provided): void
{
    if ($expected === null || $provided === null || !hash_equals($expected, $provided)) {
        throw new AuthError('CSRF_INVALID', 403);
    }
}

function anonymousPayload(AuthService $service, array $config): array
{
    $csrf = $service->anonymousCsrf(cookieValue($config['cookie_name'] . '_csrf'));
    if ($csrf === null) {
        $csrf = AuthService::randomToken();
        setAuthCookie($config, $config['cookie_name'] . '_csrf', $service->anonymousCsrfCookie($csrf), time() + 900, '/api/admin/auth');
    }
    return ['authenticated' => false, 'user' => null, 'csrfToken' => $csrf];
}

function requestJson(): array
{
    if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
        throw new AuthError('INVALID_REQUEST', 400);
    }
    $contents = file_get_contents('php://input', false, null, 0, 8193);
    if ($contents === false || strlen($contents) > 8192) {
        throw new AuthError('INVALID_REQUEST', 400);
    }
    try {
        $body = json_decode($contents, true, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        throw new AuthError('INVALID_REQUEST', 400);
    }
    if (!is_array($body)) {
        throw new AuthError('INVALID_REQUEST', 400);
    }
    return $body;
}

function handleAuthHttp(): never
{
    header_remove('X-Powered-By');
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $routes = [
        '/api/admin/auth/session' => 'GET',
        '/api/admin/auth/login' => 'POST',
        '/api/admin/auth/logout' => 'POST',
        '/api/admin/auth/authorize' => 'GET',
        '/api/admin/audit-logs' => 'GET',
        '/api/admin/audit-events' => 'POST',
    ];
    if (!is_string($path) || !isset($routes[$path])) {
        sendJson(404, ['error' => 'NOT_FOUND']);
    }
    if ($routes[$path] !== $method) {
        header('Allow: ' . $routes[$path]);
        sendJson(405, ['error' => 'METHOD_NOT_ALLOWED']);
    }
    try {
        $config = loadConfig();
        $address = $_SERVER['REMOTE_ADDR'] ?? '';
        if ($config['environment'] === 'development' && !isLoopback($address)) {
            throw new AuthError('FORBIDDEN', 403);
        }
        if ($config['environment'] === 'production' && (($_SERVER['HTTPS'] ?? '') !== 'on')) {
            throw new AuthError('FORBIDDEN', 403);
        }
        $internal = in_array($path, ['/api/admin/auth/authorize', '/api/admin/audit-events'], true);
        if ($internal) {
            $providedKey = $_SERVER['HTTP_X_ESI_INTERNAL_KEY'] ?? '';
            if (!isLoopback($address) || !is_string($providedKey) || !hash_equals($config['internal_key'], $providedKey)) {
                throw new AuthError('FORBIDDEN', 403);
            }
        }
        $pdo = connectDatabase($config);
        $audit = new MysqlAuditLog($pdo);
        if ($path === '/api/admin/audit-events') {
            // Trusted Node outbox can replay after logout; the private key never reaches browsers.
            sendJson(200, $audit->ingest(requestJson()));
        }
        $service = new AuthService(new MysqlAuthStore($pdo), new RateLimiter($config['private_directory'], $config['internal_key']), $config);
        $token = cookieValue($config['cookie_name']);
        $session = $service->session($token);

        if ($internal) {
            if ($session === null) {
                throw new AuthError('AUTH_REQUIRED', 401);
            }
            $originalMethod = $_SERVER['HTTP_X_ESI_REQUEST_METHOD'] ?? '';
            if (!is_string($originalMethod) || !preg_match('/^[A-Z]{3,10}$/D', $originalMethod)) {
                throw new AuthError('FORBIDDEN', 403);
            }
            $origin = $_SERVER['HTTP_X_ESI_REQUEST_ORIGIN'] ?? null;
            $write = !in_array($originalMethod, ['GET', 'HEAD'], true);
            requireOrigin($config, $origin, $write);
            if ($write) {
                requireCsrf($session['csrfToken'], $_SERVER['HTTP_X_ESI_CSRF'] ?? null);
            }
            sendJson(200, ['authenticated' => true] + $session);
        }

        requireOrigin($config, $_SERVER['HTTP_ORIGIN'] ?? null, $method === 'POST');
        if ($path === '/api/admin/audit-logs') {
            if ($session === null) throw new AuthError('AUTH_REQUIRED', 401);
            if ($session['user']['role'] !== 'admin') throw new AuthError('FORBIDDEN', 403);
            sendJson(200, $audit->listEvents($_GET));
        }
        if ($path === '/api/admin/auth/session') {
            if ($session !== null) {
                sendJson(200, ['authenticated' => true] + $session);
            }
            if ($token !== null) {
                setAuthCookie($config, $config['cookie_name'], '', 1, '/api/admin');
            }
            sendJson(200, anonymousPayload($service, $config));
        }

        $expectedCsrf = $session['csrfToken'] ?? $service->anonymousCsrf(cookieValue($config['cookie_name'] . '_csrf'));
        requireCsrf($expectedCsrf, $_SERVER['HTTP_X_ESI_CSRF'] ?? null);
        $body = requestJson();
        if ($path === '/api/admin/auth/login') {
            $result = $service->login(is_string($body['username'] ?? null) ? $body['username'] : '',
                is_string($body['password'] ?? null) ? $body['password'] : '', $address, $token);
            setAuthCookie($config, $config['cookie_name'], $result['token'], $result['expires'], '/api/admin');
            setAuthCookie($config, $config['cookie_name'] . '_csrf', '', 1, '/api/admin/auth');
            sendJson(200, ['authenticated' => true, 'user' => $result['user'], 'csrfToken' => $result['csrfToken']]);
        }

        if ($session === null || $token === null) {
            throw new AuthError('AUTH_REQUIRED', 401);
        }
        $service->logout($token);
        setAuthCookie($config, $config['cookie_name'], '', 1, '/api/admin');
        // Do not reuse the pre-login CSRF cookie after logout.
        $_COOKIE[$config['cookie_name'] . '_csrf'] = '';
        sendJson(200, anonymousPayload($service, $config));
    } catch (AuthError|AuditError $error) {
        if ($error->retryAfter > 0) {
            header('Retry-After: ' . $error->retryAfter);
        }
        sendJson($error->status, ['error' => $error->errorCode]);
    } catch (Throwable $error) {
        // Avoid logging exception messages: PDO errors may contain connection details.
        error_log('ESI admin auth unavailable (' . get_class($error) . ')');
        sendJson(503, ['error' => 'CONFIGURATION_ERROR']);
    }
}
