<?php
declare(strict_types=1);

// Test-only CLI controls for an isolated development database. Never an HTTP endpoint.
if (PHP_SAPI !== 'cli' || getenv('ESI_AUTH_TEST') !== '1') {
    http_response_code(404);
    exit(1);
}

require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Store.php';

try {
    $config = \Esi\Admin\loadConfig();
    if ($config['environment'] !== 'development'
        || !preg_match('/(?:^|;)dbname=esi_dev(?:;|$)/', substr($config['dsn'], 6))) {
        throw new RuntimeException('Only the isolated development database is allowed');
    }
    $pdo = \Esi\Admin\connectDatabase($config);
    $action = $argv[1] ?? '';
    $hash = getenv('ESI_TEST_SESSION_HASH') ?: '';
    if (in_array($action, ['expire-session', 'idle-session', 'session-storage'], true)
        && !preg_match('/^[a-f0-9]{64}$/D', $hash)) {
        throw new RuntimeException('A test session hash is required');
    }
    if ($action === 'role-editor' || $action === 'role-admin') {
        $statement = $pdo->prepare('UPDATE admin_users SET role=:role WHERE username=\'esi_dev_admin\'');
        $statement->execute(['role' => $action === 'role-editor' ? 'editor' : 'admin']);
        echo json_encode(['updated' => $statement->rowCount()], JSON_THROW_ON_ERROR);
    } elseif ($action === 'audit-fixtures') {
        $actor = $pdo->query("SELECT id FROM admin_users WHERE username='esi_dev_admin'")->fetchColumn();
        $insert = $pdo->prepare("INSERT INTO admin_events (actor_id,action,result,details,created_at) VALUES (:actor,'restore','success',:details,:created)");
        $dates = array_merge(array_fill(0, 28, '2001-01-02 00:00:00'), ['2001-01-01 16:59:59', '2001-01-01 17:00:00', '2001-01-02 16:59:59', '2001-01-02 17:00:00']);
        foreach ($dates as $date) $insert->execute(['actor' => $actor, 'created' => $date,
            'details' => '{"password":"PRIVATE_FIXTURE_VALUE","eventId":"private","source":"fixture","title":"<script>escaped</script>","reason":"raw exception PRIVATE_FIXTURE_VALUE"}']);
        $pdo->exec("INSERT INTO admin_events (actor_id,action,result,details,created_at) VALUES (NULL,'login','failure','{\"reason\":\"INVALID_CREDENTIALS\"}','2000-01-01 00:00:00')");
        echo json_encode(['inserted' => 33], JSON_THROW_ON_ERROR);
    } elseif ($action === 'audit-storage') {
        $statement = $pdo->prepare('SELECT project_id,version_id,details FROM admin_events WHERE LOCATE(:prefix,BINARY details)=1');
        $eventId = getenv('ESI_TEST_EVENT_ID') ?: '';
        if (!preg_match('/^[a-f0-9-]{36}$/D', $eventId)) throw new RuntimeException('A test event identifier is required');
        $statement->execute(['prefix' => '{"eventId":"' . $eventId . '",']);
        $rows = $statement->fetchAll();
        echo json_encode(['matching' => count($rows), 'nullProjectKeys' => count($rows) === 1 && $rows[0]['project_id'] === null && $rows[0]['version_id'] === null], JSON_THROW_ON_ERROR);
    } elseif ($action === 'disable-user' || $action === 'enable-user') {
        $statement = $pdo->prepare('UPDATE admin_users SET is_active=:active WHERE username=\'esi_dev_admin\'');
        $statement->execute(['active' => $action === 'enable-user' ? 1 : 0]);
        echo json_encode(['updated' => $statement->rowCount()], JSON_THROW_ON_ERROR);
    } elseif ($action === 'expire-session' || $action === 'idle-session') {
        $sql = $action === 'expire-session'
            ? 'UPDATE admin_sessions SET expires_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 SECOND) WHERE token_hash=:hash'
            : 'UPDATE admin_sessions SET last_seen_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 31 MINUTE) WHERE token_hash=:hash';
        $statement = $pdo->prepare($sql);
        $statement->execute(['hash' => $hash]);
        echo json_encode(['updated' => $statement->rowCount()], JSON_THROW_ON_ERROR);
    } elseif ($action === 'session-storage') {
        $csrfHash = getenv('ESI_TEST_CSRF_HASH') ?: '';
        if (!preg_match('/^[a-f0-9]{64}$/D', $csrfHash)) throw new RuntimeException('A test CSRF hash is required');
        $statement = $pdo->prepare('SELECT COUNT(*) AS matching_sessions FROM admin_sessions WHERE token_hash=:hash AND csrf_token_hash=:csrf AND LENGTH(token_hash)=64 AND LENGTH(csrf_token_hash)=64 AND revoked_at IS NULL');
        $statement->execute(['hash' => $hash, 'csrf' => $csrfHash]);
        echo json_encode($statement->fetch(), JSON_THROW_ON_ERROR);
    } else {
        throw new RuntimeException('Unsupported test operation');
    }
    echo "\n";
} catch (Throwable $error) {
    fwrite(STDERR, 'Development test operation failed (' . get_class($error) . ").\n");
    exit(1);
}
