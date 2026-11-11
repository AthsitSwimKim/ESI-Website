<?php
declare(strict_types=1);

// CLI-only local bootstrap. It cannot read or modify the Hosting database.
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Store.php';

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

try {
    $config = \Esi\Admin\loadConfig();
    if ($config['environment'] !== 'development'
        || !preg_match('/(?:^|;)dbname=esi_dev(?:;|$)/', substr($config['dsn'], 6))) {
        throw new RuntimeException('Only the isolated esi_dev database can be initialized');
    }
    $username = getenv('ESI_DEV_ADMIN_USERNAME') ?: '';
    $password = getenv('ESI_DEV_ADMIN_PASSWORD') ?: '';
    if ($username !== 'esi_dev_admin' || !preg_match('/^[A-Za-z0-9_-]{43}$/D', $password)) {
        throw new RuntimeException('Private development credentials are required');
    }
    $pdo = \Esi\Admin\connectDatabase($config);
    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    if ($tables === []) {
        $schema = file_get_contents(__DIR__ . '/../../../database/001_admin_schema.sql');
        if ($schema === false) throw new RuntimeException('Schema file missing');
        $schema = preg_replace('/^--[^\n]*$/m', '', $schema);
        $schema = preg_replace('/USE\s+`esithcom_website`\s*;/i', '', $schema);
        foreach (explode(';', $schema) as $statement) {
            if (trim($statement) !== '') $pdo->exec($statement);
        }
    } elseif (count($tables) !== 10 || !in_array('admin_users', $tables, true)) {
        throw new RuntimeException('Existing development schema is incomplete; not overwritten');
    }
    $existing = $pdo->prepare('SELECT username,password_hash,role,is_active FROM admin_users WHERE username=:username');
    $existing->execute(['username' => $username]);
    $user = $existing->fetch();
    if ($user === false) {
        if ((int) $pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn() !== 0) {
            throw new RuntimeException('Existing development users are not overwritten');
        }
        $insert = $pdo->prepare('INSERT INTO admin_users (username,display_name,password_hash,role,is_active,created_at,updated_at) VALUES (:username,:display_name,:hash,\'admin\',1,UTC_TIMESTAMP(),UTC_TIMESTAMP())');
        $insert->execute(['username' => $username, 'display_name' => 'ESI Development Admin', 'hash' => password_hash($password, PASSWORD_BCRYPT, ['cost' => 12])]);
    } elseif (!password_verify($password, $user['password_hash'])
        || $user['role'] !== 'admin' || (int) $user['is_active'] !== 1) {
        throw new RuntimeException('Development password does not match; refusing to reset it');
    }
    echo "Local development schema and Admin verified.\n";
} catch (Throwable $error) {
    // Never echo connection strings, passwords, hashes, or PDO exception details.
    fwrite(STDERR, "Local development initialization failed (" . get_class($error) . ").\n");
    exit(1);
}
