<?php
declare(strict_types=1);

namespace Esi\Admin;

use RuntimeException;

function isLoopback(string $address): bool
{
    return in_array($address, ['127.0.0.1', '::1', '::ffff:127.0.0.1'], true);
}

/** Hosting bootstrap supplies the actual document root, never a request header. */
function adminPublicDirectory(): string|false
{
    return realpath(defined('ESI_ADMIN_PUBLIC_ROOT') ? ESI_ADMIN_PUBLIC_ROOT : __DIR__ . '/../public');
}

function outsidePublicDirectory(string $directory): string
{
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Private directory unavailable');
    }
    $resolved = realpath($directory);
    $public = adminPublicDirectory();
    if ($resolved === false || $public === false) {
        throw new RuntimeException('Private directory unavailable');
    }
    $normalized = strtolower(str_replace('\\', '/', $resolved));
    $webRoot = strtolower(str_replace('\\', '/', $public));
    if ($normalized === $webRoot || str_starts_with($normalized, $webRoot . '/')) {
        throw new RuntimeException('Private directory must be outside the web root');
    }
    return $resolved;
}

/** Parse only the DSN fields the application uses, never duplicate or hidden targets. */
function parseMysqlDsn(string $dsn): array
{
    if (!str_starts_with($dsn, 'mysql:')) {
        throw new RuntimeException('MySQL DSN required');
    }
    $parts = [];
    foreach (explode(';', substr($dsn, 6)) as $segment) {
        if (trim($segment) === '') continue;
        $pair = explode('=', $segment, 2);
        if (count($pair) !== 2) throw new RuntimeException('Invalid MySQL DSN');
        $key = strtolower(trim($pair[0]));
        $value = trim($pair[1]);
        if (!in_array($key, ['host', 'port', 'dbname', 'charset'], true) || isset($parts[$key]) || $value === '') {
            throw new RuntimeException('Invalid or duplicate MySQL DSN field');
        }
        $parts[$key] = $value;
    }
    if (!isset($parts['host'], $parts['dbname'])
        || !preg_match('/^[A-Za-z0-9._:\[\]-]+$/D', $parts['host'])
        || !preg_match('/^[A-Za-z0-9_]{1,64}$/D', $parts['dbname'])) {
        throw new RuntimeException('Explicit database host and name required');
    }
    $parts['host'] = strtolower($parts['host']);
    $parts['port'] ??= '3306';
    $parts['charset'] ??= 'utf8mb4';
    if (!preg_match('/^[1-9][0-9]{0,4}$/D', $parts['port']) || (int) $parts['port'] > 65535
        || strtolower($parts['charset']) !== 'utf8mb4') {
        throw new RuntimeException('Invalid database port or charset');
    }
    $parts['port'] = (int) $parts['port'];
    $parts['charset'] = 'utf8mb4';
    return $parts;
}

function requirePrivateCaFile(mixed $filename): string
{
    if (!is_string($filename) || $filename === '') throw new RuntimeException('A trusted database CA file is required');
    $resolved = realpath($filename);
    $public = adminPublicDirectory();
    if ($resolved === false || !is_file($resolved) || $public === false) {
        throw new RuntimeException('Database CA file unavailable');
    }
    $normalized = strtolower(str_replace('\\', '/', $resolved));
    $webRoot = strtolower(str_replace('\\', '/', $public));
    if (str_starts_with($normalized, $webRoot . '/')) {
        throw new RuntimeException('Database CA configuration must be outside the web root');
    }
    // An actual read is authoritative; is_readable() can misreport Windows ACLs.
    $contents = @file_get_contents($resolved);
    if ($contents === false || !str_contains($contents, '-----BEGIN CERTIFICATE-----')) {
        throw new RuntimeException('Database CA file must be a PEM certificate bundle');
    }
    return $resolved;
}

/** @return array<string, mixed> */
function loadConfig(?string $filename = null): array
{
    $filename ??= getenv('ESI_ADMIN_CONFIG') ?: '';
    $resolved = $filename !== '' ? realpath($filename) : false;
    $public = adminPublicDirectory();
    if ($resolved === false || !is_file($resolved) || $public === false) {
        throw new RuntimeException('Private configuration is required');
    }
    $normalized = strtolower(str_replace('\\', '/', $resolved));
    $webRoot = strtolower(str_replace('\\', '/', $public));
    if (str_starts_with($normalized, $webRoot . '/')) {
        throw new RuntimeException('Configuration must be outside the web root');
    }
    $config = require $resolved;
    if (!is_array($config)) {
        throw new RuntimeException('Invalid configuration');
    }
    foreach (['environment', 'dsn', 'username', 'password', 'internal_key', 'private_directory'] as $field) {
        if (!isset($config[$field]) || !is_string($config[$field])) {
            throw new RuntimeException('Invalid configuration');
        }
    }
    if (!in_array($config['environment'], ['development', 'production'], true)
        || !str_starts_with($config['dsn'], 'mysql:')
        || strlen($config['internal_key']) < 32
        || str_contains(strtolower($config['internal_key']), 'replace')
        || !isset($config['allowed_origins']) || !is_array($config['allowed_origins'])
        || count($config['allowed_origins']) === 0) {
        throw new RuntimeException('Invalid configuration');
    }
    foreach ($config['allowed_origins'] as $origin) {
        if (!is_string($origin)) {
            throw new RuntimeException('Invalid origin');
        }
        $parts = parse_url($origin);
        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])
            || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])
            || (isset($parts['path']) && $parts['path'] !== '')) {
            throw new RuntimeException('Invalid origin');
        }
        if ($config['environment'] === 'development') {
            if (!in_array($parts['host'], ['localhost', '127.0.0.1', '[::1]', '::1'], true)
                || !in_array($parts['scheme'], ['http', 'https'], true)) {
                throw new RuntimeException('Development origins must be loopback');
            }
        } elseif ($parts['scheme'] !== 'https') {
            throw new RuntimeException('Production origins must use HTTPS');
        }
    }
    $config['database_target'] ??= 'local';
    if (!is_string($config['database_target']) || !in_array($config['database_target'], ['local', 'chaiyo'], true)) {
        throw new RuntimeException('Unknown database target');
    }
    $database = parseMysqlDsn($config['dsn']);
    if ($config['database_target'] === 'local') {
        $config['database_transport'] ??= 'local';
        if ($config['database_transport'] !== 'local') {
            throw new RuntimeException('Local database profile cannot select a remote transport');
        }
        if (!in_array($database['host'], ['localhost', '127.0.0.1', '[::1]', '::1'], true)) {
            throw new RuntimeException('Local database profile must use loopback');
        }
    } else {
        if ($config['environment'] === 'production'
            && array_diff($config['allowed_origins'], ['https://esi-th.com', 'https://www.esi-th.com']) !== []) {
            throw new RuntimeException('Chaiyo production origins must match the approved website');
        }
        if ($database['host'] !== 'mysql-5.5.chaiyohosting.com' || $database['port'] !== 3306
            || $database['dbname'] !== 'esithcom_website' || $config['username'] !== 'esi_webapp'
            || $config['password'] === '') {
            throw new RuntimeException('Chaiyo requires the explicit approved database endpoint and private credentials');
        }
        if (($config['database_tls_verify_server_cert'] ?? true) !== true) {
            throw new RuntimeException('Database certificate verification cannot be disabled');
        }
        // Legacy is an explicit provider-protocol selection, never a TLS failure fallback.
        $config['database_transport'] ??= 'tls';
        if (!is_string($config['database_transport']) || !in_array($config['database_transport'], ['tls', 'legacy'], true)) {
            throw new RuntimeException('Unknown Chaiyo database transport');
        }
        $config['database_tls_verify_server_cert'] = true;
        if ($config['database_transport'] === 'tls') {
            $config['database_tls_ca'] = requirePrivateCaFile($config['database_tls_ca'] ?? null);
        }
    }
    $config['database_dsn_parts'] = $database;
    // Rebuild from parsed fields so PDO cannot interpret a second host/database differently.
    $config['dsn'] = 'mysql:host=' . $database['host'] . ';port=' . $database['port']
        . ';dbname=' . $database['dbname'] . ';charset=utf8mb4';
    $config['cookie_name'] ??= 'esi_admin_session';
    $config['cookie_secure'] ??= true;
    $config['session_ttl'] ??= 28800;
    $config['idle_timeout'] ??= 1800;
    if (!is_string($config['cookie_name']) || !preg_match('/^[A-Za-z][A-Za-z0-9_]{3,63}$/', $config['cookie_name'])
        || !is_bool($config['cookie_secure'])
        || ($config['environment'] === 'production' && !$config['cookie_secure'])
        || !is_int($config['session_ttl']) || $config['session_ttl'] < 300 || $config['session_ttl'] > 86400
        || !is_int($config['idle_timeout']) || $config['idle_timeout'] < 60
        || $config['idle_timeout'] > $config['session_ttl']) {
        throw new RuntimeException('Invalid session configuration');
    }
    $config['private_directory'] = outsidePublicDirectory($config['private_directory']);
    return $config;
}
