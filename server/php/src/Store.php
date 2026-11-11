<?php
declare(strict_types=1);

namespace Esi\Admin;

use PDO;
use Throwable;

require_once __DIR__ . '/MysqlTls.php';
require_once __DIR__ . '/AuditLog.php';

interface AuthStore
{
    public function userByUsername(string $username): ?array;
    public function sessionByHash(string $hash): ?array;
    public function createSession(int $userId, string $tokenHash, string $csrfHash, string $now, string $expires): void;
    public function revokeSession(string $hash, string $now): void;
    public function touchSession(string $hash, string $now): void;
    public function markLogin(int $userId, string $now): void;
    public function transaction(callable $action): mixed;
    public function recordAuthEvent(?int $actorId, string $action, string $result, array $details, string $now): void;
}

function databaseRequiresTls(array $config): bool
{
    return ($config['database_target'] ?? 'local') === 'chaiyo'
        && ($config['database_transport'] ?? 'tls') === 'tls';
}

function databasePdoOptions(array $config): array
{
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 5,
    ];
    if (databaseRequiresTls($config)) {
        $options[PDO::MYSQL_ATTR_SSL_CA] = requirePrivateCaFile($config['database_tls_ca'] ?? null);
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
    }
    return $options;
}

function initializeDatabaseSession(PDO $pdo, array $config): void
{
    if (databaseRequiresTls($config)) {
        assertDatabaseSessionTls($pdo);
    }
    $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'");
    $pdo->exec("SET time_zone='+00:00'");
    $pdo->exec('SET SESSION foreign_key_checks=1');
}

function connectDatabase(array $config): PDO
{
    if (databaseRequiresTls($config)) {
        preflightChaiyoTls($config);
    }
    $pdo = new PDO($config['dsn'], $config['username'], $config['password'], databasePdoOptions($config));
    initializeDatabaseSession($pdo, $config);
    return $pdo;
}

final class MysqlAuthStore implements AuthStore
{
    public function __construct(private PDO $pdo) {}

    public function transaction(callable $action): mixed
    {
        $this->pdo->beginTransaction();
        try {
            $result = $action();
            $this->pdo->commit();
            return $result;
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    public function recordAuthEvent(?int $actorId, string $action, string $result, array $details, string $now): void
    {
        (new MysqlAuditLog($this->pdo))->recordAuth($actorId, $action, $result, $details, $now);
    }

    public function userByUsername(string $username): ?array
    {
        $statement = $this->pdo->prepare('SELECT id,username,display_name,password_hash,role,is_active FROM admin_users WHERE username=:username LIMIT 1');
        $statement->execute(['username' => $username]);
        return $statement->fetch() ?: null;
    }

    public function sessionByHash(string $hash): ?array
    {
        $statement = $this->pdo->prepare('SELECT s.token_hash,s.csrf_token_hash,s.created_at,s.last_seen_at,s.expires_at,s.revoked_at,u.id,u.username,u.display_name,u.role,u.is_active FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=:hash LIMIT 1');
        $statement->execute(['hash' => $hash]);
        return $statement->fetch() ?: null;
    }

    public function createSession(int $userId, string $tokenHash, string $csrfHash, string $now, string $expires): void
    {
        $statement = $this->pdo->prepare('INSERT INTO admin_sessions (user_id,token_hash,csrf_token_hash,created_at,last_seen_at,expires_at) VALUES (:user_id,:token_hash,:csrf_hash,:created_at,:last_seen_at,:expires_at)');
        $statement->execute(['user_id' => $userId, 'token_hash' => $tokenHash, 'csrf_hash' => $csrfHash, 'created_at' => $now, 'last_seen_at' => $now, 'expires_at' => $expires]);
    }

    public function revokeSession(string $hash, string $now): void
    {
        $statement = $this->pdo->prepare('UPDATE admin_sessions SET revoked_at=:now WHERE token_hash=:hash AND revoked_at IS NULL');
        $statement->execute(['now' => $now, 'hash' => $hash]);
    }

    public function touchSession(string $hash, string $now): void
    {
        $statement = $this->pdo->prepare('UPDATE admin_sessions SET last_seen_at=:now WHERE token_hash=:hash AND revoked_at IS NULL');
        $statement->execute(['now' => $now, 'hash' => $hash]);
    }

    public function markLogin(int $userId, string $now): void
    {
        $statement = $this->pdo->prepare('UPDATE admin_users SET last_login_at=:now WHERE id=:id');
        $statement->execute(['now' => $now, 'id' => $userId]);
    }
}
