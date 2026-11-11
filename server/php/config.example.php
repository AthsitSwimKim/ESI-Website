<?php
declare(strict_types=1);

// Copy to an ignored PRIVATE directory and set ESI_ADMIN_CONFIG to its absolute path.
// This example intentionally cannot authenticate until the private values are supplied.
return [
    'environment' => 'development',
    'database_target' => 'local',
    'dsn' => 'mysql:host=127.0.0.1;port=13307;dbname=esi_dev;charset=utf8mb4',
    'username' => 'esi_dev',
    'password' => '',
    'allowed_origins' => ['http://localhost:5173'],
    'internal_key' => 'REPLACE_WITH_AT_LEAST_32_RANDOM_CHARACTERS',
    'cookie_name' => 'esi_admin_dev_session',
    'cookie_secure' => false,
    'private_directory' => __DIR__ . '/../../.esi-admin/dev/private',
    'session_ttl' => 28800,
    'idle_timeout' => 1800,
    // Remote Chaiyo is a separate opt-in configuration with its exact approved endpoint.
    // Its default transport is verified TLS 1.2+ with a trusted CA. The provider's
    // legacy MySQL protocol requires database_transport='legacy' explicitly; there
    // is no downgrade on a TLS error. Never reuse these local fixture credentials.
];
