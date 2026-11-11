<?php
declare(strict_types=1);

namespace Esi\Admin;

use RuntimeException;
use Throwable;

final class AuthError extends RuntimeException
{
    public function __construct(public readonly string $errorCode, public readonly int $status, public readonly int $retryAfter = 0)
    {
        parent::__construct($errorCode);
    }
}

final class AuthService
{
    // A valid cost-12 hash avoids a cheap username-existence timing oracle.
    private const DUMMY_HASH = '$2y$12$4Umg0rCJwMswRw/l.SwHvuQV01coP0eWmGzd61QH2RvAOMANUBGC.';

    public function __construct(private AuthStore $store, private RateLimiter $limiter, private array $config) {}

    public static function randomToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    public function csrfForToken(string $token): string
    {
        return hash_hmac('sha256', 'session-csrf:' . $token, $this->config['internal_key']);
    }

    public function anonymousCsrfCookie(string $token, ?int $issuedAt = null): string
    {
        $value = $token . '.' . ($issuedAt ?? time());
        return $value . '.' . hash_hmac('sha256', 'anonymous-csrf:' . $value, $this->config['internal_key']);
    }

    public function anonymousCsrf(?string $cookie): ?string
    {
        if ($cookie === null || !preg_match('/^([A-Za-z0-9_-]{43})\.(\d{10})\.([a-f0-9]{64})$/D', $cookie, $matches)
            || (int) $matches[2] < time() - 900 || (int) $matches[2] > time() + 30) {
            return null;
        }
        return hash_equals($this->anonymousCsrfCookie($matches[1], (int) $matches[2]), $cookie) ? $matches[1] : null;
    }

    public function session(?string $token, ?int $clock = null): ?array
    {
        $now = $clock ?? time();
        if ($token === null || !preg_match('/^[A-Za-z0-9_-]{43}$/D', $token)) {
            return null;
        }
        $hash = hash('sha256', $token);
        $session = $this->store->sessionByHash($hash);
        if ($session === null || $session['revoked_at'] !== null) {
            return null;
        }
        if ((int) $session['is_active'] !== 1 || !in_array($session['role'], ['admin', 'editor'], true)
            || strtotime($session['expires_at'] . ' UTC') <= $now
            || strtotime($session['last_seen_at'] . ' UTC') + $this->config['idle_timeout'] <= $now
            || !hash_equals($session['csrf_token_hash'], hash('sha256', $this->csrfForToken($token)))) {
            $this->store->revokeSession($hash, gmdate('Y-m-d H:i:s', $now));
            return null;
        }
        if (strtotime($session['last_seen_at'] . ' UTC') + 60 <= $now) {
            $this->store->touchSession($hash, gmdate('Y-m-d H:i:s', $now));
        }
        return ['user' => $this->publicUser($session), 'csrfToken' => $this->csrfForToken($token)];
    }

    public function login(string $username, string $password, string $address, ?string $oldToken): array
    {
        $username = trim($username);
        $retry = $this->limiter->consume(substr($username, 0, 64), $address, time());
        if ($retry > 0) {
            $this->recordBestEffort(null, 'login', 'failure', ['reason' => 'RATE_LIMITED']);
            throw new AuthError('RATE_LIMITED', 429, $retry);
        }
        $validInput = preg_match('/^[A-Za-z0-9_@.\-]{1,64}$/D', $username) === 1
            && strlen($password) >= 1 && strlen($password) <= 72 && !str_contains($password, "\0");
        $user = $validInput ? $this->store->userByUsername($username) : null;
        $verified = password_verify($validInput ? $password : '', $user['password_hash'] ?? self::DUMMY_HASH);
        if (!$verified || $user === null || (int) $user['is_active'] !== 1 || !in_array($user['role'], ['admin', 'editor'], true)) {
            $this->recordBestEffort(null, 'login', 'failure', ['reason' => 'INVALID_CREDENTIALS']);
            throw new AuthError('INVALID_CREDENTIALS', 401);
        }
        $now = time();
        $token = self::randomToken();
        $csrf = $this->csrfForToken($token);
        $expires = $now + $this->config['session_ttl'];
        $this->limiter->clearSuccessfulUser($username, $address);
        $this->store->transaction(function () use ($user, $token, $csrf, $now, $expires, $oldToken): void {
            $date = gmdate('Y-m-d H:i:s', $now);
            $this->store->createSession((int) $user['id'], hash('sha256', $token), hash('sha256', $csrf), $date, gmdate('Y-m-d H:i:s', $expires));
            if ($oldToken !== null && preg_match('/^[A-Za-z0-9_-]{43}$/D', $oldToken)) {
                $this->store->revokeSession(hash('sha256', $oldToken), $date);
            }
            $this->store->markLogin((int) $user['id'], $date);
            $this->store->recordAuthEvent((int) $user['id'], 'login', 'success', [], $date);
        });
        return ['token' => $token, 'expires' => $expires, 'user' => $this->publicUser($user), 'csrfToken' => $csrf];
    }

    public function logout(string $token): void
    {
        $hash = hash('sha256', $token);
        $session = $this->store->sessionByHash($hash);
        $this->store->revokeSession($hash, gmdate('Y-m-d H:i:s'));
        if ($session !== null && $session['revoked_at'] === null) {
            $this->recordBestEffort((int) $session['id'], 'logout', 'success', []);
        }
    }

    private function recordBestEffort(?int $actorId, string $action, string $result, array $details): void
    {
        try {
            $this->store->recordAuthEvent($actorId, $action, $result, $details, gmdate('Y-m-d H:i:s'));
        } catch (Throwable $error) {
            error_log('ESI authentication audit unavailable (' . get_class($error) . ')');
        }
    }

    private function publicUser(array $user): array
    {
        return ['id' => (int) $user['id'], 'username' => $user['username'], 'displayName' => $user['display_name'], 'role' => $user['role']];
    }
}
