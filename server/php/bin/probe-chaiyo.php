<?php
declare(strict_types=1);

// CLI-only connection diagnostic. Default reads the greeting without credentials.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(1); }
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Store.php';

try {
    $mode = $argv[1] ?? 'capabilities';
    if ($mode === 'capabilities') {
        $result = \Esi\Admin\probeMysqlTlsCapability('mysql-5.5.chaiyohosting.com', 3306);
        unset($result['capabilities']);
        echo json_encode(['stage' => 'greeting', 'credentialsSent' => false] + $result, JSON_THROW_ON_ERROR), "\n";
        exit($result['supportsTls'] ? 0 : 2);
    }
    if ($mode === 'tls') {
        $result = \Esi\Admin\preflightChaiyoTls([
            'database_target' => 'chaiyo',
            'dsn' => 'mysql:host=mysql-5.5.chaiyohosting.com;port=3306;dbname=esithcom_website;charset=utf8mb4',
            'database_tls_ca' => $argv[2] ?? '',
            'database_tls_verify_server_cert' => true,
        ]);
        echo json_encode(['stage' => 'verified-tls', 'credentialsSent' => false] + $result, JSON_THROW_ON_ERROR), "\n";
        exit;
    }
    if ($mode !== 'connection') throw new RuntimeException('Unsupported probe mode');
    $config = \Esi\Admin\loadConfig();
    if ($config['database_target'] !== 'chaiyo') throw new RuntimeException('Explicit Chaiyo profile required');
    $pdo = \Esi\Admin\connectDatabase($config);
    $cipher = $pdo->query("SHOW SESSION STATUS LIKE 'Ssl_cipher'")->fetch(PDO::FETCH_NUM);
    $metadata = $pdo->query('SELECT DATABASE() AS database_name,VERSION() AS server_version')->fetch();
    echo json_encode(['stage' => 'verified-connection', 'transport' => $config['database_transport'],
        'encrypted' => ($cipher[1] ?? '') !== '', 'tlsVerified' => \Esi\Admin\databaseRequiresTls($config)] + $metadata, JSON_THROW_ON_ERROR), "\n";
} catch (Throwable $error) {
    $code = $error instanceof \Esi\Admin\DatabaseTransportError ? $error->errorCode : 'DATABASE_CONFIGURATION_OR_CONNECTION_FAILED';
    echo json_encode(['error' => $code], JSON_THROW_ON_ERROR), "\n";
    exit(1);
}
