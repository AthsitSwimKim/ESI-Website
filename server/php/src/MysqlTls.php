<?php
declare(strict_types=1);

namespace Esi\Admin;

use PDO;
use RuntimeException;

require_once __DIR__ . '/Config.php';

final class DatabaseTransportError extends RuntimeException
{
    public function __construct(public readonly string $errorCode)
    {
        parent::__construct($errorCode);
    }
}

/** Parse the greeting only. It contains no user, password, or authentication response. */
function mysqlGreetingMetadata(string $payload): array
{
    if ($payload === '' || ord($payload[0]) !== 10) {
        throw new DatabaseTransportError('MYSQL_GREETING_INVALID');
    }
    $versionEnd = strpos($payload, "\0", 1);
    if ($versionEnd === false || $versionEnd > 200) {
        throw new DatabaseTransportError('MYSQL_GREETING_INVALID');
    }
    $capabilityOffset = $versionEnd + 14;
    if (strlen($payload) < $capabilityOffset + 2) {
        throw new DatabaseTransportError('MYSQL_GREETING_INVALID');
    }
    $capabilities = unpack('v', substr($payload, $capabilityOffset, 2))[1];
    if (strlen($payload) >= $capabilityOffset + 7) {
        $capabilities |= unpack('v', substr($payload, $capabilityOffset + 5, 2))[1] << 16;
    }
    $version = substr($payload, 1, $versionEnd - 1);
    if (!preg_match('/^[A-Za-z0-9._+\- ]{1,200}$/D', $version)) {
        throw new DatabaseTransportError('MYSQL_GREETING_INVALID');
    }
    return ['serverVersion' => $version, 'capabilities' => $capabilities,
        'supportsTls' => ($capabilities & 0x0800) !== 0,
        'supportsProtocol41' => ($capabilities & 0x0200) !== 0];
}

/** @param resource $socket */
function mysqlReadExact($socket, int $length): string
{
    $result = '';
    while (strlen($result) < $length) {
        $chunk = @fread($socket, $length - strlen($result));
        if ($chunk === false || $chunk === '') {
            throw new DatabaseTransportError('MYSQL_GREETING_INVALID');
        }
        $result .= $chunk;
    }
    return $result;
}

/** @param resource $socket */
function mysqlReadGreeting($socket): array
{
    $header = mysqlReadExact($socket, 4);
    $length = ord($header[0]) | (ord($header[1]) << 8) | (ord($header[2]) << 16);
    if (ord($header[3]) !== 0 || $length < 1 || $length > 65536) {
        throw new DatabaseTransportError('MYSQL_GREETING_INVALID');
    }
    return mysqlGreetingMetadata(mysqlReadExact($socket, $length));
}

/** TLS upgrade request only: no username/database/password/authentication packet. */
function mysqlSslRequest(int $serverCapabilities): string
{
    if (($serverCapabilities & 0x0800) === 0) {
        throw new DatabaseTransportError('MYSQL_TLS_UNAVAILABLE');
    }
    if (($serverCapabilities & 0x0200) === 0) {
        throw new DatabaseTransportError('MYSQL_GREETING_INVALID');
    }
    $flags = $serverCapabilities & (0x0001 | 0x0004 | 0x0200 | 0x0800 | 0x8000);
    $payload = pack('VVC', $flags, 16777216, 45) . str_repeat("\0", 23);
    return substr(pack('V', strlen($payload)), 0, 3) . "\x01" . $payload;
}

function assertModernMysqlTls(string $version, string $cipher): void
{
    if ($cipher === '') throw new DatabaseTransportError('MYSQL_TLS_CIPHER_MISSING');
    if (!in_array($version, ['TLSv1.2', 'TLSv1.3'], true)) {
        throw new DatabaseTransportError('MYSQL_TLS_VERSION_UNSUPPORTED');
    }
}

/** Greeting-only probe; closes without sending even an SSL upgrade request. */
function probeMysqlTlsCapability(string $host, int $port): array
{
    $socket = @stream_socket_client('tcp://' . $host . ':' . $port, $errno, $error, 5, STREAM_CLIENT_CONNECT);
    if ($socket === false) throw new DatabaseTransportError('MYSQL_CONNECTION_UNAVAILABLE');
    try {
        stream_set_timeout($socket, 5);
        return mysqlReadGreeting($socket);
    } finally {
        fclose($socket);
    }
}

/** Verify modern TLS and CA/hostname BEFORE any credentials can be sent to PDO. */
function preflightChaiyoTls(array $config): array
{
    $database = parseMysqlDsn($config['dsn']);
    if (($config['database_target'] ?? null) !== 'chaiyo'
        || ($config['database_transport'] ?? 'tls') !== 'tls'
        || $database['host'] !== 'mysql-5.5.chaiyohosting.com' || $database['port'] !== 3306
        || $database['dbname'] !== 'esithcom_website'
        || ($config['database_tls_verify_server_cert'] ?? true) !== true
        || !extension_loaded('openssl') || !defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
        throw new DatabaseTransportError('MYSQL_TLS_CONFIGURATION_ERROR');
    }
    $ca = requirePrivateCaFile($config['database_tls_ca'] ?? null);
    $context = stream_context_create(['ssl' => [
        'cafile' => $ca,
        'verify_peer' => true,
        'verify_peer_name' => true,
        'peer_name' => $database['host'],
        'allow_self_signed' => false,
        'SNI_enabled' => true,
    ]]);
    $socket = @stream_socket_client('tcp://' . $database['host'] . ':' . $database['port'], $errno, $error, 5, STREAM_CLIENT_CONNECT, $context);
    if ($socket === false) throw new DatabaseTransportError('MYSQL_CONNECTION_UNAVAILABLE');
    try {
        stream_set_timeout($socket, 5);
        $greeting = mysqlReadGreeting($socket);
        $request = mysqlSslRequest($greeting['capabilities']);
        $offset = 0;
        while ($offset < strlen($request)) {
            $written = @fwrite($socket, substr($request, $offset));
            if ($written === false || $written === 0) {
                throw new DatabaseTransportError('MYSQL_TLS_NEGOTIATION_FAILED');
            }
            $offset += $written;
        }
        $methods = STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
        if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) $methods |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
        if (@stream_socket_enable_crypto($socket, true, $methods) !== true) {
            throw new DatabaseTransportError('MYSQL_TLS_NEGOTIATION_FAILED');
        }
        $crypto = stream_get_meta_data($socket)['crypto'] ?? [];
        $version = (string) ($crypto['protocol'] ?? '');
        $cipher = (string) ($crypto['cipher_name'] ?? '');
        assertModernMysqlTls($version, $cipher);
        return ['serverVersion' => $greeting['serverVersion'], 'tlsVersion' => $version, 'cipher' => $cipher];
    } finally {
        // Deliberately never send a HandshakeResponse41 or authentication data.
        fclose($socket);
    }
}

/** Read transport status first; do not read application data before this succeeds. */
function assertDatabaseSessionTls(PDO $pdo): array
{
    $versionRow = $pdo->query("SHOW SESSION STATUS LIKE 'Ssl_version'")->fetch(PDO::FETCH_NUM);
    $cipherRow = $pdo->query("SHOW SESSION STATUS LIKE 'Ssl_cipher'")->fetch(PDO::FETCH_NUM);
    $version = (string) ($versionRow[1] ?? '');
    $cipher = (string) ($cipherRow[1] ?? '');
    assertModernMysqlTls($version, $cipher);
    return ['tlsVersion' => $version, 'cipher' => $cipher];
}
