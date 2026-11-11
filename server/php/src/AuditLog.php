<?php
declare(strict_types=1);

namespace Esi\Admin;

use DateTimeImmutable;
use DateTimeZone;
use PDO;
use RuntimeException;
use Throwable;

final class AuditError extends RuntimeException
{
    public function __construct(public readonly string $errorCode, public readonly int $status, public readonly int $retryAfter = 0)
    {
        parent::__construct($errorCode);
    }
}

function newAuditEventId(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    $hex = bin2hex($bytes);
    return substr($hex, 0, 8) . '-' . substr($hex, 8, 4) . '-' . substr($hex, 12, 4)
        . '-' . substr($hex, 16, 4) . '-' . substr($hex, 20);
}

final class MysqlAuditLog
{
    public const ACTIONS = ['login', 'logout', 'save_draft', 'publish', 'unpublish', 'delete', 'restore', 'upload'];
    private const PROJECT_ACTIONS = ['save_draft', 'publish', 'unpublish', 'delete', 'upload'];
    private const REASONS = ['INVALID_CREDENTIALS', 'RATE_LIMITED', 'CONFLICT', 'DUPLICATE_SLUG', 'INVALID_PROJECT',
        'FEATURED_LIMIT', 'INVALID_IMAGE', 'IMAGE_NOT_FOUND', 'NOT_FOUND', 'SAVE_FAILED', 'BACKEND_UNAVAILABLE',
        'FORBIDDEN', 'TOO_LARGE', 'STORE_CORRUPT', 'UNKNOWN_ERROR'];
    private const DETAIL_FIELDS = ['projectId', 'title', 'uploadCount', 'reason', 'created', 'migratedCount'];

    public function __construct(private PDO $pdo) {}

    /** Only deliberately bounded project metadata is retained, never request bodies. */
    public static function safeDetails(array $input, bool $strict = true): array
    {
        if ($strict && array_diff(array_keys($input), self::DETAIL_FIELDS) !== []) {
            throw new AuditError('INVALID_AUDIT_EVENT', 400);
        }
        $result = [];
        foreach (self::DETAIL_FIELDS as $field) {
            if (!array_key_exists($field, $input)) continue;
            $value = $input[$field];
            if ($field === 'projectId') {
                if (!is_int($value) || $value < 1 || $value > 4294967295) {
                    if ($strict) throw new AuditError('INVALID_AUDIT_EVENT', 400);
                    continue;
                }
            } elseif ($field === 'uploadCount' || $field === 'migratedCount') {
                $max = $field === 'uploadCount' ? 11 : 10000;
                if (!is_int($value) || $value < 0 || $value > $max) {
                    if ($strict) throw new AuditError('INVALID_AUDIT_EVENT', 400);
                    continue;
                }
            } elseif ($field === 'created') {
                if (!is_bool($value)) {
                    if ($strict) throw new AuditError('INVALID_AUDIT_EVENT', 400);
                    continue;
                }
            } elseif ($field === 'reason') {
                if (!is_string($value)) {
                    if ($strict) throw new AuditError('INVALID_AUDIT_EVENT', 400);
                    continue;
                }
                $value = in_array($value, self::REASONS, true) ? $value : 'UNKNOWN_ERROR';
            } elseif ($field === 'title') {
                if (!is_string($value) || preg_match('//u', $value) !== 1) {
                    if ($strict) throw new AuditError('INVALID_AUDIT_EVENT', 400);
                    continue;
                }
                $value = trim(preg_replace('/[\x00-\x1f\x7f]/u', ' ', $value));
                preg_match_all('/./us', $value, $characters);
                $value = implode('', array_slice($characters[0], 0, 200));
            }
            $result[$field] = $value;
        }
        return $result;
    }

    public function recordAuth(?int $actorId, string $action, string $result, array $details, string $createdAt): void
    {
        if (!in_array($action, ['login', 'logout'], true) || !in_array($result, ['success', 'failure'], true)) {
            throw new AuditError('INVALID_AUDIT_EVENT', 400);
        }
        $safe = self::safeDetails($details);
        // Authentication events can retain only a coarse reason, never project/user input.
        $safe = array_intersect_key($safe, ['reason' => true]);
        $json = json_encode(['eventId' => newAuditEventId(), 'source' => 'auth'] + $safe,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $this->insert($actorId, $action, $result, $json, $createdAt);
    }

    /** Internal delivery is trusted only after the HTTP layer checks loopback + private key. */
    public function ingest(array $payload): array
    {
        if (array_diff(array_keys($payload), ['eventId', 'actorId', 'action', 'result', 'createdAt', 'details']) !== []) {
            throw new AuditError('INVALID_AUDIT_EVENT', 400);
        }
        $eventId = $payload['eventId'] ?? null;
        $actorId = $payload['actorId'] ?? null;
        $action = $payload['action'] ?? null;
        $result = $payload['result'] ?? null;
        $createdAt = $payload['createdAt'] ?? null;
        $details = $payload['details'] ?? null;
        if (!is_string($eventId) || !preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/D', $eventId)
            || !is_int($actorId) || $actorId < 1 || $actorId > 4294967295
            || !is_string($action) || !in_array($action, self::PROJECT_ACTIONS, true)
            || !is_string($result) || !in_array($result, ['success', 'failure'], true)
            || !is_string($createdAt) || !is_array($details)) {
            throw new AuditError('INVALID_AUDIT_EVENT', 400);
        }
        $date = DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $createdAt, new DateTimeZone('UTC'));
        if ($date === false || $date->format('Y-m-d H:i:s') !== $createdAt
            || $date->getTimestamp() > time() + 300 || $date->format('Y') < '1970' || $date->format('Y') > '2100') {
            throw new AuditError('INVALID_AUDIT_EVENT', 400);
        }
        $json = json_encode(['eventId' => $eventId, 'source' => 'local-projects'] + self::safeDetails($details),
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $database = (string) $this->pdo->query('SELECT DATABASE()')->fetchColumn();
        $lockName = 'esi_audit_' . substr(hash('sha256', $database . ':' . $eventId), 0, 40);
        $lock = $this->pdo->prepare('SELECT GET_LOCK(:name,5)');
        $lock->execute(['name' => $lockName]);
        if ((int) $lock->fetchColumn() !== 1) throw new AuditError('AUDIT_BUSY', 503, 2);
        try {
            $actor = $this->pdo->prepare('SELECT id FROM admin_users WHERE id=:id LIMIT 1');
            $actor->execute(['id' => $actorId]);
            if ($actor->fetchColumn() === false) throw new AuditError('INVALID_AUDIT_EVENT', 400);
            // MySQL 5.5 has no JSON column/functions. Canonical JSON starts with this exact UUID prefix.
            $prefix = '{"eventId":"' . $eventId . '",';
            $existing = $this->pdo->prepare('SELECT id,actor_id,action,result,details,created_at FROM admin_events WHERE LOCATE(:prefix,BINARY details)=1 LIMIT 1');
            $existing->execute(['prefix' => $prefix]);
            $row = $existing->fetch();
            if ($row !== false) {
                if ((int) $row['actor_id'] !== $actorId || $row['action'] !== $action || $row['result'] !== $result
                    || $row['created_at'] !== $createdAt || $row['details'] !== $json) {
                    throw new AuditError('AUDIT_EVENT_CONFLICT', 409);
                }
                return ['accepted' => true, 'eventId' => $eventId, 'id' => (string) $row['id'], 'duplicate' => true];
            }
            $id = $this->insert($actorId, $action, $result, $json, $createdAt);
            return ['accepted' => true, 'eventId' => $eventId, 'id' => $id, 'duplicate' => false];
        } finally {
            try {
                $release = $this->pdo->prepare('SELECT RELEASE_LOCK(:name)');
                $release->execute(['name' => $lockName]);
            } catch (Throwable $error) {
                // Connection close also releases a named lock; do not report a stored event as failed.
                error_log('ESI audit lock release unavailable (' . get_class($error) . ')');
            }
        }
    }

    public static function filters(array $query): array
    {
        $allowed = ['page', 'action', 'result', 'actorId', 'from', 'to'];
        if (array_diff(array_keys($query), $allowed) !== []) throw new AuditError('INVALID_AUDIT_FILTER', 400);
        $filters = ['page' => 1, 'action' => null, 'result' => null, 'actorId' => null, 'from' => null, 'to' => null];
        foreach ($allowed as $key) {
            if (!isset($query[$key]) || $query[$key] === '') continue;
            if (!is_string($query[$key])) throw new AuditError('INVALID_AUDIT_FILTER', 400);
            $value = $query[$key];
            if ($key === 'page') {
                if (!preg_match('/^[1-9][0-9]{0,6}$/D', $value) || (int) $value > 1000000) throw new AuditError('INVALID_AUDIT_FILTER', 400);
                $value = (int) $value;
            } elseif ($key === 'action') {
                if (!in_array($value, self::ACTIONS, true)) throw new AuditError('INVALID_AUDIT_FILTER', 400);
            } elseif ($key === 'result') {
                if (!in_array($value, ['success', 'failure'], true)) throw new AuditError('INVALID_AUDIT_FILTER', 400);
            } elseif ($key === 'actorId') {
                if ($value !== 'none') {
                    if (!preg_match('/^[1-9][0-9]{0,9}$/D', $value) || (float) $value > 4294967295) throw new AuditError('INVALID_AUDIT_FILTER', 400);
                    $value = (int) $value;
                }
            } else {
                $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, new DateTimeZone('Asia/Bangkok'));
                if ($date === false || $date->format('Y-m-d') !== $value || $date->format('Y') < '1970' || $date->format('Y') > '2100') {
                    throw new AuditError('INVALID_AUDIT_FILTER', 400);
                }
            }
            $filters[$key] = $value;
        }
        if ($filters['from'] !== null && $filters['to'] !== null && $filters['from'] > $filters['to']) {
            throw new AuditError('INVALID_AUDIT_FILTER', 400);
        }
        return $filters;
    }

    public function listEvents(array $query): array
    {
        $filters = self::filters($query);
        $where = [];
        $parameters = [];
        foreach (['action', 'result'] as $field) {
            if ($filters[$field] !== null) { $where[] = 'e.' . $field . '=:' . $field; $parameters[$field] = $filters[$field]; }
        }
        if ($filters['actorId'] === 'none') $where[] = 'e.actor_id IS NULL';
        elseif ($filters['actorId'] !== null) { $where[] = 'e.actor_id=:actor'; $parameters['actor'] = $filters['actorId']; }
        foreach (['from', 'to'] as $field) {
            if ($filters[$field] === null) continue;
            $date = new DateTimeImmutable($filters[$field], new DateTimeZone('Asia/Bangkok'));
            if ($field === 'to') $date = $date->modify('+1 day');
            $where[] = 'e.created_at' . ($field === 'from' ? '>=' : '<') . ':' . $field . '_date';
            $parameters[$field . '_date'] = $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
        }
        $clause = $where === [] ? '' : ' WHERE ' . implode(' AND ', $where);
        $count = $this->pdo->prepare('SELECT COUNT(*) FROM admin_events e' . $clause);
        $count->execute($parameters);
        $total = (int) $count->fetchColumn();
        $totalPages = max(1, (int) ceil($total / 25));
        $page = min($filters['page'], $totalPages);
        $statement = $this->pdo->prepare('SELECT e.id,e.action,e.result,e.actor_id,e.created_at,e.details,u.username,u.display_name FROM admin_events e LEFT JOIN admin_users u ON u.id=e.actor_id'
            . $clause . ' ORDER BY e.created_at DESC,e.id DESC LIMIT :page_size OFFSET :page_offset');
        foreach ($parameters as $key => $value) $statement->bindValue(':' . $key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        $statement->bindValue(':page_size', 25, PDO::PARAM_INT);
        $statement->bindValue(':page_offset', ($page - 1) * 25, PDO::PARAM_INT);
        $statement->execute();
        $items = [];
        foreach ($statement->fetchAll() as $row) {
            $details = json_decode((string) ($row['details'] ?? ''), true);
            $items[] = ['id' => (string) $row['id'], 'action' => $row['action'], 'result' => $row['result'],
                'actor' => $row['actor_id'] === null ? null : ['id' => (int) $row['actor_id'], 'username' => $row['username'], 'displayName' => $row['display_name']],
                'createdAt' => (new DateTimeImmutable($row['created_at'], new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z'),
                'details' => (object) self::safeDetails(is_array($details) ? $details : [], false)];
        }
        $actors = [];
        foreach ($this->pdo->query('SELECT id,username,display_name FROM admin_users ORDER BY display_name,id')->fetchAll() as $row) {
            $actors[] = ['id' => (int) $row['id'], 'username' => $row['username'], 'displayName' => $row['display_name']];
        }
        return ['items' => $items, 'page' => $page, 'pageSize' => 25, 'total' => $total, 'totalPages' => $totalPages, 'actors' => $actors];
    }

    private function insert(?int $actorId, string $action, string $result, string $details, string $createdAt): string
    {
        // Projects are still local files. Never forge foreign keys into the unmigrated MySQL project tables.
        $statement = $this->pdo->prepare('INSERT INTO admin_events (actor_id,project_id,version_id,action,result,details,created_at) VALUES (:actor,NULL,NULL,:action,:result,:details,:created_at)');
        $statement->execute(['actor' => $actorId, 'action' => $action, 'result' => $result, 'details' => $details, 'created_at' => $createdAt]);
        return $this->pdo->lastInsertId();
    }
}
