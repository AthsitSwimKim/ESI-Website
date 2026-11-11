<?php
declare(strict_types=1);

// Copy to config.php in THIS PRIVATE directory outside httpdocs; never publish it.
return [
    'environment' => 'production',
    'database_target' => 'chaiyo',
    'database_transport' => 'legacy',
    'dsn' => 'mysql:host=mysql-5.5.chaiyohosting.com;port=3306;dbname=esithcom_website;charset=utf8mb4',
    'username' => 'esi_webapp',
    'password' => '',
    // A random key is generated in the separate private config prepared locally.
    'internal_key' => 'REPLACE_WITH_64_RANDOM_HEX_CHARACTERS',
    'private_directory' => __DIR__ . '/data',
    'allowed_origins' => ['https://esi-th.com', 'https://www.esi-th.com'],
    'cookie_name' => 'esi_admin_session',
    'cookie_secure' => true,
    'session_ttl' => 28800,
    'idle_timeout' => 1800,
];
