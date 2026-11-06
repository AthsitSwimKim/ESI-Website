<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    http_response_code(405);
    exit;
}

if ($method === 'POST' && (($_SERVER['HTTP_X_ESI_VISITOR'] ?? '') !== '1' ||
    ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? 'same-origin') !== 'same-origin')) {
    http_response_code(403);
    exit;
}

function readVisitorState(string $directory): ?array
{
    $path = $directory . '/count.json';
    if (!is_file($path)) {
        return null;
    }
    $json = file_get_contents($path);
    $state = $json === false ? null : json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    if (!is_string($state['date'] ?? null) || !is_int($state['total'] ?? null) ||
        $state['total'] < 0 || !is_string($state['key'] ?? null) ||
        !preg_match('/^[a-f0-9]{64}$/D', $state['key']) || !is_array($state['seen'] ?? null)) {
        throw new RuntimeException('Invalid visitor count file');
    }
    return $state;
}

function recordVisitor(string $directory, string $ip, string $agent): int
{
    if (!is_dir($directory) && !@mkdir($directory, 0700) && !is_dir($directory)) {
        throw new RuntimeException('Cannot create visitor count directory');
    }

    // Lock a separate file so replacing the JSON never changes the lock's inode.
    $lock = fopen($directory . '/count.lock', 'c');
    if ($lock === false) {
        throw new RuntimeException('Cannot open visitor count lock');
    }

    try {
        if (!flock($lock, LOCK_EX)) {
            throw new RuntimeException('Cannot lock visitor count');
        }

        $date = (new DateTimeImmutable('now', new DateTimeZone('Asia/Bangkok')))->format('Y-m-d');
        $path = $directory . '/count.json';
        $state = readVisitorState($directory) ??
            ['date' => $date, 'total' => 0, 'key' => bin2hex(random_bytes(32)), 'seen' => []];

        if (!filter_var($ip, FILTER_VALIDATE_IP) || $agent === '' ||
            preg_match('~bot\b|crawler|spider|headless|lighthouse|curl/|wget/|python-requests|uptimerobot~i', $agent)) {
            return $state['total'];
        }

        if ($state['date'] !== $date) {
            $state['date'] = $date;
            $state['key'] = bin2hex(random_bytes(32));
            $state['seen'] = [];
        }
        $visitor = hash_hmac('sha256', inet_pton($ip) . "\0" . $agent, $state['key']);
        if (isset($state['seen'][$visitor])) {
            return $state['total'];
        }

        $state['seen'][$visitor] = true;
        ++$state['total'];
        $json = json_encode($state, JSON_THROW_ON_ERROR);
        $temporary = $path . '.' . bin2hex(random_bytes(8)) . '.tmp';
        try {
            if (file_put_contents($temporary, $json) !== strlen($json) || !rename($temporary, $path)) {
                throw new RuntimeException('Cannot save visitor count');
            }
        } finally {
            if (is_file($temporary)) {
                unlink($temporary);
            }
        }

        return $state['total'];
    } finally {
        fclose($lock);
    }
}

umask(0077);
try {
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
    $root = $documentRoot === '' ? false : realpath($documentRoot);
    if ($root === false || dirname($root) === $root) {
        throw new RuntimeException('Missing visitor count document root');
    }
    $directory = dirname($root) . '/.esi-visitor-count';
    // GET only reads the atomically replaced file, without creating files or counting a visit.
    $count = $method === 'GET' ? (readVisitorState($directory)['total'] ?? 0) : recordVisitor(
        $directory,
        $_SERVER['REMOTE_ADDR'] ?? '',
        substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 512),
    );
    echo json_encode(['count' => $count], JSON_THROW_ON_ERROR);
} catch (Throwable $error) {
    error_log('ESI visitor count: ' . $error->getMessage());
    http_response_code(503);
    echo '{"error":"Visitor count unavailable"}';
}
