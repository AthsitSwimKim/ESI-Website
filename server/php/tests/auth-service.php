<?php
declare(strict_types=1);

// Standalone security regression tests. All users/sessions are in memory.
require_once __DIR__ . '/../src/Http.php';

use Esi\Admin\AuthError;
use Esi\Admin\AuthService;
use Esi\Admin\AuthStore;
use Esi\Admin\RateLimiter;
use Esi\Admin\DatabaseTransportError;
use Esi\Admin\AuditError;
use Esi\Admin\MysqlAuditLog;
use function Esi\Admin\assertModernMysqlTls;
use function Esi\Admin\databasePdoOptions;
use function Esi\Admin\databaseRequiresTls;
use function Esi\Admin\initializeDatabaseSession;
use function Esi\Admin\loadConfig;
use function Esi\Admin\mysqlGreetingMetadata;
use function Esi\Admin\mysqlSslRequest;
use function Esi\Admin\outsidePublicDirectory;
use function Esi\Admin\parseMysqlDsn;
use function Esi\Admin\preflightChaiyoTls;
use function Esi\Admin\requireCsrf;
use function Esi\Admin\requireOrigin;

final class MemoryAuthStore implements AuthStore
{
    public array $users = [];
    public array $sessions = [];
    public array $events = [];
    public bool $failAudit = false;

    public function transaction(callable $action): mixed
    {
        $before = [$this->users, $this->sessions, $this->events];
        try { return $action(); } catch (Throwable $error) {
            [$this->users, $this->sessions, $this->events] = $before;
            throw $error;
        }
    }

    public function recordAuthEvent(?int $actorId, string $action, string $result, array $details, string $now): void
    {
        if ($this->failAudit) throw new RuntimeException('Injected audit storage failure');
        $this->events[] = compact('actorId', 'action', 'result', 'details', 'now');
    }

    public function userByUsername(string $username): ?array
    {
        foreach ($this->users as $user) {
            if (strcasecmp($user['username'], $username) === 0) return $user;
        }
        return null;
    }

    public function sessionByHash(string $hash): ?array
    {
        $row = $this->sessions[$hash] ?? null;
        return $row !== null ? $row + $this->users[$row['user_id']] : null;
    }

    public function createSession(int $userId, string $tokenHash, string $csrfHash, string $now, string $expires): void
    {
        $this->sessions[$tokenHash] = ['user_id' => $userId, 'token_hash' => $tokenHash,
            'csrf_token_hash' => $csrfHash, 'created_at' => $now, 'last_seen_at' => $now,
            'expires_at' => $expires, 'revoked_at' => null];
    }

    public function revokeSession(string $hash, string $now): void
    {
        if (isset($this->sessions[$hash])) $this->sessions[$hash]['revoked_at'] = $now;
    }

    public function touchSession(string $hash, string $now): void
    {
        $this->sessions[$hash]['last_seen_at'] = $now;
    }

    public function markLogin(int $userId, string $now): void
    {
        $this->users[$userId]['last_login_at'] = $now;
    }
}

final class TlsStatusStatement extends PDOStatement
{
    public function __construct(private array $row) {}
    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $cursorOrientation = PDO::FETCH_ORI_NEXT, int $cursorOffset = 0): mixed
    {
        return $this->row;
    }
}

/** Records SQL ordering without opening a network or database connection. */
final class TlsSessionPdo extends PDO
{
    public array $queries = [];
    public array $commands = [];
    public function __construct(private string $version, private string $cipher) {}
    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false
    {
        $this->queries[] = $query;
        if ($query === "SHOW SESSION STATUS LIKE 'Ssl_version'") return new TlsStatusStatement(['Ssl_version', $this->version]);
        if ($query === "SHOW SESSION STATUS LIKE 'Ssl_cipher'") return new TlsStatusStatement(['Ssl_cipher', $this->cipher]);
        throw new RuntimeException('Unexpected data query before TLS verification');
    }
    public function exec(string $statement): int|false
    {
        $this->commands[] = $statement;
        return 0;
    }
}

$checks = 0;
function check(bool $condition, string $description): void
{
    global $checks;
    if (!$condition) throw new RuntimeException('Failed: ' . $description);
    $checks++;
}

function expectAuthError(callable $action, string $code, int $status): void
{
    try { $action(); } catch (AuthError $error) {
        check($error->errorCode === $code && $error->status === $status, $code . ' has expected status');
        return;
    }
    throw new RuntimeException('Expected ' . $code);
}

function expectConfigurationError(callable $action, string $description): void
{
    try { $action(); } catch (RuntimeException) { check(true, $description); return; }
    throw new RuntimeException('Expected configuration rejection: ' . $description);
}

function expectTransportError(callable $action, string $code): void
{
    try { $action(); } catch (DatabaseTransportError $error) {
        check($error->errorCode === $code, $code . ' rejected');
        return;
    }
    throw new RuntimeException('Expected transport rejection: ' . $code);
}

function expectAuditError(callable $action, string $code): void
{
    try { $action(); } catch (AuditError $error) {
        check($error->errorCode === $code && $error->status === 400, $code . ' rejected');
        return;
    }
    throw new RuntimeException('Expected audit rejection: ' . $code);
}

$privateRoot = dirname(__DIR__, 3) . '/.esi-admin/dev/php-tests';
if (!is_dir($privateRoot)) mkdir($privateRoot, 0700, true);
$directory = $privateRoot . '/run-' . bin2hex(random_bytes(8));
mkdir($directory, 0700);

try {
    $config = ['internal_key' => bin2hex(random_bytes(32)), 'session_ttl' => 600, 'idle_timeout' => 120];
    $store = new MemoryAuthStore();
    $testPassword = 'Unit-test-only-password-12345';
    $store->users[1] = ['id' => 1, 'username' => 'unit_admin', 'display_name' => 'Unit Test Admin',
        'password_hash' => password_hash($testPassword, PASSWORD_BCRYPT, ['cost' => 4]), 'role' => 'admin', 'is_active' => 1];
    $limiter = new RateLimiter($directory, $config['internal_key']);
    $service = new AuthService($store, $limiter, $config);

    check($service->session(null) === null, 'anonymous session is not authenticated');
    check($service->session('malformed') === null, 'malformed session rejected');
    check($service->session(AuthService::randomToken()) === null, 'unknown random session rejected');
    $anonymousToken = AuthService::randomToken();
    $anonymousCookie = $service->anonymousCsrfCookie($anonymousToken);
    check($service->anonymousCsrf($anonymousCookie) === $anonymousToken, 'signed anonymous CSRF accepted');
    check($service->anonymousCsrf($anonymousCookie . 'x') === null, 'tampered anonymous CSRF rejected');
    check($service->anonymousCsrf($service->anonymousCsrfCookie($anonymousToken, time() - 901)) === null, 'expired anonymous CSRF rejected');
    check($service->anonymousCsrf($service->anonymousCsrfCookie($anonymousToken, time() + 31)) === null, 'future anonymous CSRF rejected');

    expectAuthError(fn() => $service->login('unit_admin', 'wrong-password', '127.0.0.10', null), 'INVALID_CREDENTIALS', 401);
    expectAuthError(fn() => $service->login('unknown', $testPassword, '127.0.0.11', null), 'INVALID_CREDENTIALS', 401);
    expectAuthError(fn() => $service->login('unit_admin', str_repeat('x', 73), '127.0.0.12', null), 'INVALID_CREDENTIALS', 401);
    $store->users[1]['is_active'] = 0;
    expectAuthError(fn() => $service->login('unit_admin', $testPassword, '127.0.0.13', null), 'INVALID_CREDENTIALS', 401);
    $store->users[1]['is_active'] = 1;
    $store->users[1]['role'] = 'unknown-role';
    expectAuthError(fn() => $service->login('unit_admin', $testPassword, '127.0.0.14', null), 'INVALID_CREDENTIALS', 401);
    $store->users[1]['role'] = 'admin';
    check(count($store->events) === 5, 'each unsuccessful password login records one audit event');
    foreach ($store->events as $event) {
        check($event['actorId'] === null && $event['details'] === ['reason' => 'INVALID_CREDENTIALS'], 'unsuccessful login has no claimed actor or submitted username');
    }

    $login = $service->login('unit_admin', $testPassword, '127.0.0.1', null);
    check(preg_match('/^[A-Za-z0-9_-]{43}$/D', $login['token']) === 1, 'opaque session uses 32 random bytes');
    check($login['user'] === ['id' => 1, 'username' => 'unit_admin', 'displayName' => 'Unit Test Admin', 'role' => 'admin'], 'only intended user fields returned');
    $stored = $store->sessions[hash('sha256', $login['token'])];
    check(strlen($stored['token_hash']) === 64 && strlen($stored['csrf_token_hash']) === 64, 'stored tokens are SHA-256 hashes');
    check(!str_contains(json_encode($store->sessions), $login['token']), 'raw bearer token not stored');
    check(!str_contains(json_encode($store->sessions), $login['csrfToken']), 'raw CSRF token not stored');
    check($service->session($login['token'])['csrfToken'] === $login['csrfToken'], 'session survives later request');
    check(isset($store->users[1]['last_login_at']), 'successful login recorded');
    check(end($store->events)['actorId'] === 1 && end($store->events)['action'] === 'login' && end($store->events)['result'] === 'success', 'login audit actor derives verified database user');
    check(!str_contains(json_encode($store->events), $testPassword) && !str_contains(json_encode($store->events), $login['token']) && !str_contains(json_encode($store->events), '127.0.0.'), 'authentication audit omits password, bearer token and raw IP');

    $rotated = $service->login('unit_admin', $testPassword, '127.0.0.1', $login['token']);
    check($rotated['token'] !== $login['token'] && $rotated['csrfToken'] !== $login['csrfToken'], 'login rotates both tokens');
    check($service->session($login['token']) === null, 'old session revoked after rotation');
    check($service->session($rotated['token']) !== null, 'rotated session valid');
    $service->logout($rotated['token']);
    check($service->session($rotated['token']) === null, 'logout prevents replay');
    check(end($store->events)['action'] === 'logout' && end($store->events)['actorId'] === 1, 'logout audit derives session actor');
    $logoutEventCount = count($store->events);
    $service->logout($rotated['token']);
    check(count($store->events) === $logoutEventCount, 'replaying revoked logout creates no duplicate audit');

    $beforeFailedLogin = [$store->sessions, $store->users, $store->events];
    $store->failAudit = true;
    expectConfigurationError(fn() => $service->login('unit_admin', $testPassword, '127.0.0.51', null), 'audit failure rejects successful login before session commit');
    check([$store->sessions, $store->users, $store->events] === $beforeFailedLogin, 'failed login audit rolls back session and last-login changes');
    expectAuthError(fn() => $service->login('unit_admin', 'wrong-password', '127.0.0.52', null), 'INVALID_CREDENTIALS', 401);
    $store->failAudit = false;
    $revokeOnAuditFailure = $service->login('unit_admin', $testPassword, '127.0.0.53', null);
    $store->failAudit = true;
    $service->logout($revokeOnAuditFailure['token']);
    check($service->session($revokeOnAuditFailure['token']) === null, 'logout still revokes session while audit is unavailable');
    $store->failAudit = false;

    for ($i = 0; $i < 5; $i++) expectAuthError(fn() => $service->login('unknown-rate-user', 'wrong-password', '127.0.0.54', null), 'INVALID_CREDENTIALS', 401);
    expectAuthError(fn() => $service->login('unknown-rate-user', 'wrong-password', '127.0.0.54', null), 'RATE_LIMITED', 429);
    check(end($store->events)['actorId'] === null && end($store->events)['details'] === ['reason' => 'RATE_LIMITED'], 'rate limit produces a coarse anonymous audit event');

    check(MysqlAuditLog::filters([]) === ['page' => 1, 'action' => null, 'result' => null, 'actorId' => null, 'from' => null, 'to' => null], 'empty audit filters use explicit defaults');
    check(MysqlAuditLog::filters(['actorId' => 'none', 'from' => '2026-11-10', 'to' => '2026-11-11'])['actorId'] === 'none', 'anonymous actor and Bangkok date filters accepted');
    foreach ([['page' => '0'], ['page' => '1000001'], ['page' => ['1']], ['action' => 'drop'], ['result' => 'unknown'], ['actorId' => '-1'], ['actorId' => '4294967296'], ['from' => '2026-02-30'], ['from' => '2026-11-12', 'to' => '2026-11-11'], ['sql' => '1=1']] as $invalid) {
        expectAuditError(fn() => MysqlAuditLog::filters($invalid), 'INVALID_AUDIT_FILTER');
    }
    $details = MysqlAuditLog::safeDetails(['projectId' => 1, 'title' => str_repeat('ก', 201) . "\n", 'reason' => 'secret raw exception', 'uploadCount' => 11, 'created' => true]);
    check($details['title'] === str_repeat('ก', 200) && $details['reason'] === 'UNKNOWN_ERROR', 'metadata bounds Unicode title and coarsens unknown reason');
    check(MysqlAuditLog::safeDetails(['eventId' => 'private', 'password' => 'private', 'reason' => 'INVALID_CREDENTIALS'], false) === ['reason' => 'INVALID_CREDENTIALS'], 'read projection removes private/legacy detail fields');
    foreach ([['password' => 'x'], ['projectId' => '1'], ['uploadCount' => 12], ['created' => 1], ['title' => "\xff"], ['migratedCount' => -1]] as $invalid) {
        expectAuditError(fn() => MysqlAuditLog::safeDetails($invalid), 'INVALID_AUDIT_EVENT');
    }

    $disabled = $service->login('unit_admin', $testPassword, '127.0.0.1', null);
    $store->users[1]['is_active'] = 0;
    check($service->session($disabled['token']) === null, 'disabling account invalidates existing session');
    $store->users[1]['is_active'] = 1;
    check($service->session($disabled['token']) === null, 'revoked session stays invalid after account reactivation');

    $idle = $service->login('unit_admin', $testPassword, '127.0.0.1', null);
    $idleStart = strtotime($store->sessions[hash('sha256', $idle['token'])]['created_at'] . ' UTC');
    check($service->session($idle['token'], $idleStart + 120) === null, 'idle expiration enforced');
    $absolute = $service->login('unit_admin', $testPassword, '127.0.0.1', null);
    $absoluteHash = hash('sha256', $absolute['token']);
    $absoluteStart = strtotime($store->sessions[$absoluteHash]['created_at'] . ' UTC');
    $store->sessions[$absoluteHash]['last_seen_at'] = gmdate('Y-m-d H:i:s', $absoluteStart + 590);
    check($service->session($absolute['token'], $absoluteStart + 600) === null, 'absolute expiration enforced despite activity');
    $roleChange = $service->login('unit_admin', $testPassword, '127.0.0.1', null);
    $store->users[1]['role'] = 'unsupported';
    check($service->session($roleChange['token']) === null, 'role checked again on every request');

    $now = 1700000000;
    for ($i = 0; $i < 5; $i++) check($limiter->consume('limited-user', '192.0.2.1', $now) === 0, 'initial attempts allowed');
    check($limiter->consume('limited-user', '192.0.2.1', $now) === 900, 'sixth pair attempt rate limited');
    check($limiter->consume('limited-user', '192.0.2.1', $now + 901) === 0, 'rate limit expires');
    for ($i = 0; $i < 10; $i++) check($limiter->consume('distributed-user', '192.0.2.' . (10 + $i), $now) === 0, 'distributed attempts below user limit');
    check($limiter->consume('distributed-user', '192.0.2.99', $now) === 900, 'user limit spans source IPs');
    for ($i = 0; $i < 30; $i++) check($limiter->consume('ip-user-' . $i, '192.0.2.200', $now) === 0, 'IP attempts below limit');
    check($limiter->consume('ip-next-user', '192.0.2.200', $now) === 900, 'IP limit spans usernames');
    $rateContents = file_get_contents($directory . '/login-rate-limits.json');
    check(!str_contains($rateContents, 'distributed-user') && !str_contains($rateContents, '192.0.2.200'), 'rate storage does not retain raw usernames/IPs');

    $originConfig = ['allowed_origins' => ['http://localhost:5173']];
    requireOrigin($originConfig, 'http://localhost:5173', true);
    check(true, 'configured origin accepted');
    expectAuthError(fn() => requireOrigin($originConfig, null, true), 'FORBIDDEN', 403);
    expectAuthError(fn() => requireOrigin($originConfig, 'https://evil.example', false), 'FORBIDDEN', 403);
    requireCsrf('correct-token', 'correct-token');
    check(true, 'matching CSRF accepted');
    expectAuthError(fn() => requireCsrf(null, null), 'CSRF_INVALID', 403);
    expectAuthError(fn() => requireCsrf('correct-token', 'wrong-token'), 'CSRF_INVALID', 403);

    $validConfig = ['environment' => 'development', 'dsn' => 'mysql:host=127.0.0.1;port=13307;dbname=esi_dev;charset=utf8mb4',
        'username' => 'unit_test', 'password' => 'unit-test-only', 'internal_key' => bin2hex(random_bytes(32)),
        'allowed_origins' => ['http://localhost:5173'], 'cookie_secure' => false, 'private_directory' => $directory];
    $configFile = $directory . '/config.php';
    $writeConfig = function (array $value) use ($configFile): void { file_put_contents($configFile, '<?php return ' . var_export($value, true) . ';'); };
    $writeConfig($validConfig);
    check(loadConfig($configFile)['environment'] === 'development', 'local development config accepted');
    $writeConfig(array_replace($validConfig, ['dsn' => 'mysql:host=hosting.example;dbname=production;charset=utf8mb4']));
    expectConfigurationError(fn() => loadConfig($configFile), 'development cannot connect to Hosting');
    $writeConfig(array_replace($validConfig, ['allowed_origins' => ['http://not-local.example']]));
    expectConfigurationError(fn() => loadConfig($configFile), 'development cannot enable remote origins');
    $writeConfig(array_replace($validConfig, ['allowed_origins' => ['http://user@localhost:5173']]));
    expectConfigurationError(fn() => loadConfig($configFile), 'origins with embedded credentials rejected');
    $writeConfig(array_replace($validConfig, ['environment' => 'production', 'allowed_origins' => ['http://localhost:5173']]));
    expectConfigurationError(fn() => loadConfig($configFile), 'production HTTP origin rejected');
    $writeConfig(array_replace($validConfig, ['environment' => 'production', 'allowed_origins' => ['https://example.test']]));
    expectConfigurationError(fn() => loadConfig($configFile), 'production insecure cookie rejected');
    expectConfigurationError(fn() => outsidePublicDirectory(__DIR__ . '/../public'), 'private storage cannot be web root');

    // Keep the local fixture path the default; remote access needs an exact opt-in.
    $writeConfig($validConfig);
    check(loadConfig($configFile)['database_target'] === 'local', 'existing config defaults to local database');
    foreach ([
        'mysql:host=127.0.0.1;host=hosting.example;dbname=esi_dev',
        'mysql:host=127.0.0.1; HOST =hosting.example;dbname=esi_dev',
        'mysql:host=127.0.0.1;dbname=esi_dev;dbname=esithcom_website',
        'mysql:host=127.0.0.1;dbname=esi_dev;charset=utf8mb4;charset=latin1',
        'mysql:host=127.0.0.1;dbname=esi_dev;unix_socket=/tmp/mysql.sock',
        'mysql:host=127.0.0.1;dbname=esi_dev;port=0',
        'mysql:host=127.0.0.1;dbname=esi_dev;port=65536',
        'mysql:host=127.0.0.1;dbname=esi_dev;charset=latin1',
        'mysql:dbname=esi_dev',
    ] as $invalidDsn) {
        expectConfigurationError(fn() => parseMysqlDsn($invalidDsn), 'ambiguous/unsupported DSN rejected');
    }
    $writeConfig(array_replace($validConfig, ['dsn' => 'mysql:host=127.0.0.1;host=hosting.example;dbname=esi_dev']));
    expectConfigurationError(fn() => loadConfig($configFile), 'duplicate host cannot bypass local guard');

    // This is a deliberately unusable certificate fixture, not a trusted provider CA.
    // Config checks only its shape/path; the TLS handshake must validate real trust.
    $caFile = $directory . '/test-ca.pem';
    file_put_contents($caFile, "-----BEGIN CERTIFICATE-----\nUNUSABLE-TEST-FIXTURE\n-----END CERTIFICATE-----\n");
    $remoteConfig = array_replace($validConfig, [
        'database_target' => 'chaiyo',
        'dsn' => 'mysql:host=mysql-5.5.chaiyohosting.com;port=3306;dbname=esithcom_website;charset=utf8mb4',
        'username' => 'esi_webapp',
        'password' => 'test-only-not-a-hosting-password',
        'database_tls_ca' => $caFile,
        'database_tls_verify_server_cert' => true,
    ]);
    $writeConfig($remoteConfig);
    $parsedRemote = loadConfig($configFile);
    check($parsedRemote['database_target'] === 'chaiyo' && $parsedRemote['environment'] === 'development', 'explicit remote profile preserves development-only environment');
    check(databaseRequiresTls($parsedRemote) && $parsedRemote['database_transport'] === 'tls', 'omitted remote transport remains verified TLS by default');
    check($parsedRemote['database_tls_verify_server_cert'] === true, 'remote server certificate verification required');
    $options = databasePdoOptions($parsedRemote);
    check($options[PDO::MYSQL_ATTR_SSL_CA] === realpath($caFile), 'remote CA is applied in PDO constructor options');
    check($options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] === true, 'PDO cannot silently disable certificate checks');
    $legacyConfig = array_replace($remoteConfig, ['database_transport' => 'legacy', 'database_tls_ca' => '']);
    $writeConfig($legacyConfig);
    $parsedLegacy = loadConfig($configFile);
    check(!databaseRequiresTls($parsedLegacy) && $parsedLegacy['database_transport'] === 'legacy', 'explicit approved legacy transport is usable without a TLS CA');
    $legacyOptions = databasePdoOptions($parsedLegacy);
    check(!isset($legacyOptions[PDO::MYSQL_ATTR_SSL_CA]) && !isset($legacyOptions[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT]), 'legacy uses ordinary PDO protocol without claiming verified TLS');
    $legacyPdo = new TlsSessionPdo('', '');
    initializeDatabaseSession($legacyPdo, $parsedLegacy);
    check($legacyPdo->queries === [] && count($legacyPdo->commands) === 4, 'explicit legacy connection does not silently attempt or fall back from TLS');
    $writeConfig(array_replace($legacyConfig, ['environment' => 'production',
        'allowed_origins' => ['https://esi-th.com', 'https://www.esi-th.com'], 'cookie_secure' => true]));
    check(loadConfig($configFile)['environment'] === 'production', 'explicit Chaiyo production supports approved origins and secure cookies');
    foreach ([
        ['database_target' => 'local'],
        ['environment' => 'production', 'allowed_origins' => ['https://example.test'], 'cookie_secure' => true],
        ['username' => 'root'],
        ['password' => ''],
        ['dsn' => 'mysql:host=other.example;port=3306;dbname=esithcom_website;charset=utf8mb4'],
        ['dsn' => 'mysql:host=mysql-5.5.chaiyohosting.com;port=3306;dbname=other_database;charset=utf8mb4'],
    ] as $override) {
        $writeConfig(array_replace($legacyConfig, $override));
        expectConfigurationError(fn() => loadConfig($configFile), 'legacy is restricted to the approved Chaiyo endpoint, credentials and origins');
    }
    $writeConfig(array_replace($validConfig, ['database_transport' => 'legacy']));
    expectConfigurationError(fn() => loadConfig($configFile), 'local profile cannot opt into remote legacy protocol');
    foreach ([
        ['database_tls_verify_server_cert' => false],
        ['database_transport' => 'automatic'],
        ['database_tls_ca' => ''],
        ['database_tls_ca' => $directory . '/missing.pem'],
        ['database_tls_ca' => __DIR__ . '/../public/index.php'],
        ['username' => 'root'],
        ['password' => ''],
        ['dsn' => 'mysql:host=another-host.example;port=3306;dbname=esithcom_website;charset=utf8mb4'],
        ['dsn' => 'mysql:host=mysql-5.5.chaiyohosting.com;port=3307;dbname=esithcom_website;charset=utf8mb4'],
        ['dsn' => 'mysql:host=mysql-5.5.chaiyohosting.com;port=3306;dbname=another_database;charset=utf8mb4'],
        ['environment' => 'production', 'allowed_origins' => ['https://example.test'], 'cookie_secure' => true],
    ] as $override) {
        $writeConfig(array_replace($remoteConfig, $override));
        expectConfigurationError(fn() => loadConfig($configFile), 'unsafe remote profile rejected');
    }
    $writeConfig(array_replace($remoteConfig, ['database_target' => 'local']));
    expectConfigurationError(fn() => loadConfig($configFile), 'remote endpoint cannot enter local initialization profile');
    expectTransportError(fn() => preflightChaiyoTls(array_replace($remoteConfig, ['database_tls_verify_server_cert' => false])), 'MYSQL_TLS_CONFIGURATION_ERROR');

    $greeting = fn(int $flags): string => "\x0a5.5.44-test\0" . pack('V', 1) . 'abcdefgh' . "\0"
        . pack('v', $flags & 0xffff) . chr(45) . pack('v', 2) . pack('v', $flags >> 16);
    $withoutTls = mysqlGreetingMetadata($greeting(0x8201));
    check($withoutTls['serverVersion'] === '5.5.44-test' && $withoutTls['supportsTls'] === false, 'legacy greeting reports missing TLS without authentication');
    expectTransportError(fn() => mysqlSslRequest($withoutTls['capabilities']), 'MYSQL_TLS_UNAVAILABLE');
    $withTls = mysqlGreetingMetadata($greeting(0x8a01));
    $sslRequest = mysqlSslRequest($withTls['capabilities']);
    check($withTls['supportsTls'] && strlen($sslRequest) === 36 && ord($sslRequest[3]) === 1, 'TLS request is exactly the unauthenticated 32-byte SSLRequest packet');
    check(substr($sslRequest, 13) === str_repeat("\0", 23), 'SSLRequest contains no user/database/password response');
    expectTransportError(fn() => mysqlGreetingMetadata("\xfferror"), 'MYSQL_GREETING_INVALID');
    expectTransportError(fn() => mysqlGreetingMetadata("\x0atruncated"), 'MYSQL_GREETING_INVALID');
    foreach (['', 'TLSv1', 'TLSv1.0', 'TLSv1.1', 'unknown'] as $version) {
        expectTransportError(fn() => assertModernMysqlTls($version, 'AES256-SHA'), 'MYSQL_TLS_VERSION_UNSUPPORTED');
    }
    expectTransportError(fn() => assertModernMysqlTls('TLSv1.2', ''), 'MYSQL_TLS_CIPHER_MISSING');
    assertModernMysqlTls('TLSv1.2', 'ECDHE-RSA-AES256-GCM-SHA384');
    assertModernMysqlTls('TLSv1.3', 'TLS_AES_256_GCM_SHA384');
    check(true, 'TLS 1.2/1.3 accepted with a negotiated cipher');

    foreach ([['TLSv1', 'AES256-SHA'], ['', '']] as [$version, $cipher]) {
        $pdo = new TlsSessionPdo($version, $cipher);
        expectConfigurationError(fn() => initializeDatabaseSession($pdo, ['database_target' => 'chaiyo']), 'insecure PDO transport rejected');
        check($pdo->commands === [] && $pdo->queries === ["SHOW SESSION STATUS LIKE 'Ssl_version'", "SHOW SESSION STATUS LIKE 'Ssl_cipher'"], 'rejected transport performs no initialization or application data queries');
    }
    $pdo = new TlsSessionPdo('TLSv1.2', 'ECDHE-RSA-AES256-GCM-SHA384');
    initializeDatabaseSession($pdo, ['database_target' => 'chaiyo']);
    check(count($pdo->queries) === 2 && count($pdo->commands) === 4, 'only verified TLS proceeds to utf8mb4/strict/UTC session setup');

    echo 'PHP auth security checks passed: ' . $checks . "\n";
} finally {
    foreach (['login-rate-limits.json', 'config.php', 'test-ca.pem'] as $filename) {
        if (is_file($directory . '/' . $filename)) unlink($directory . '/' . $filename);
    }
    rmdir($directory);
}
