<?php
declare(strict_types=1);

namespace Esi\Admin;

use RuntimeException;
use Throwable;

final class ProjectError extends RuntimeException
{
    public function __construct(public readonly string $errorCode, public readonly int $status = 400)
    {
        parent::__construct($errorCode);
    }
}

/** Hosting file repository: one atomic state includes drafts, publication and audit outbox. */
final class ProjectRepository
{
    private string $directory;
    private string $public;
    private const KEYS = ['id', 'slug', 'title', 'titleTh', 'client', 'categories', 'industry', 'location',
        'locationTh', 'image', 'description', 'descriptionTh', 'scope', 'scopeTh', 'gallery', 'featured',
        'year', 'partners', 'partnersTh', 'imageKind', 'source'];

    public function __construct(array $config)
    {
        $this->directory = outsidePublicDirectory($config['private_directory'] . '/projects');
        $this->public = adminPublicDirectory() ?: throw new RuntimeException('Missing document root');
    }

    public static function validProject(mixed $project): bool
    {
        if (!is_array($project) || !is_int($project['id'] ?? null) || $project['id'] < 1 || $project['id'] > 4294967295) return false;
        foreach (['slug', 'title', 'client', 'location', 'image', 'description'] as $key) {
            if (!is_string($project[$key] ?? null) || trim($project[$key]) === '') return false;
        }
        foreach (['title', 'titleTh', 'client', 'location', 'locationTh', 'description', 'descriptionTh', 'source', 'slug'] as $key) {
            if (isset($project[$key]) && (!is_string($project[$key]) || strlen($project[$key]) > 40000)) return false;
        }
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $project['slug']) || strlen($project['slug']) > 200) return false;
        if (!in_array($project['industry'] ?? '', ['oil-gas', 'petrochemical', 'power-energy', 'manufacturing', 'industrial-infrastructure'], true)) return false;
        $categories = $project['categories'] ?? null;
        if (!is_array($categories) || !array_is_list($categories) || count($categories) < 1 || count($categories) > 6) return false;
        foreach ($categories as $category) {
            if (!in_array($category, ['network', 'cctv', 'access-control', 'communication', 'cybersecurity', 'maintenance'], true)) return false;
        }
        if (count(array_unique($categories)) !== count($categories)) return false;
        foreach (['scope', 'scopeTh', 'partners', 'partnersTh', 'gallery'] as $key) {
            if (!isset($project[$key])) continue;
            if (!is_array($project[$key]) || !array_is_list($project[$key]) || count($project[$key]) > ($key === 'gallery' ? 10 : 100)) return false;
            foreach ($project[$key] as $entry) if (!is_string($entry) || ($key !== 'gallery' && strlen($entry) > 40000)) return false;
        }
        if (isset($project['year']) && (!is_int($project['year']) || $project['year'] < 1900 || $project['year'] > 2100)) return false;
        if (isset($project['featured']) && !is_bool($project['featured'])) return false;
        if (isset($project['imageKind']) && !in_array($project['imageKind'], ['photo', 'illustration'], true)) return false;
        return true;
    }

    private function read(string $file): array
    {
        try {
            $data = json_decode(file_get_contents($file) ?: '', true, 64, JSON_THROW_ON_ERROR);
            if (!is_array($data)) throw new RuntimeException();
            return $data;
        } catch (Throwable) {
            throw new ProjectError('STORE_CORRUPT', 503);
        }
    }

    private function write(string $file, array $value): void
    {
        $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n";
        $temporary = $file . '.' . bin2hex(random_bytes(12)) . '.tmp';
        try {
            $handle = fopen($temporary, 'xb');
            if ($handle === false) throw new RuntimeException('State unavailable');
            try {
                chmod($temporary, 0600);
                if (fwrite($handle, $json) !== strlen($json) || !fflush($handle) || !fsync($handle)) throw new RuntimeException('State write failed');
            } finally { fclose($handle); }
            if (!rename($temporary, $file)) throw new RuntimeException('State replacement failed');
        } finally { if (is_file($temporary)) unlink($temporary); }
    }

    private function load(): array
    {
        $file = $this->directory . '/state.json';
        if (is_file($file)) {
            $state = $this->read($file);
        } else {
            $seed = $this->read(__DIR__ . '/../seed.json');
            $state = ['version' => 1, 'revision' => 0, 'nextId' => $seed['nextId'], 'published' => $seed['projects'],
                'drafts' => [], 'migrations' => [], 'outbox' => []];
        }
        if (($state['version'] ?? 0) !== 1 || !is_int($state['revision'] ?? null) || $state['revision'] < 0
            || !is_int($state['nextId'] ?? null) || $state['nextId'] < 1) throw new ProjectError('STORE_CORRUPT', 503);
        foreach (['published', 'drafts', 'migrations', 'outbox'] as $key) {
            if (!isset($state[$key]) || !is_array($state[$key]) || !array_is_list($state[$key])) throw new ProjectError('STORE_CORRUPT', 503);
        }
        foreach (['published', 'drafts'] as $key) {
            $ids = []; $slugs = [];
            foreach ($state[$key] as $project) {
                if (!self::validProject($project) || isset($ids[$project['id']]) || isset($slugs[$project['slug']])) throw new ProjectError('STORE_CORRUPT', 503);
                $ids[$project['id']] = true; $slugs[$project['slug']] = true;
                $state['nextId'] = max($state['nextId'], $project['id'] + 1);
            }
        }
        return $state;
    }

    private function snapshot(array $state): array
    {
        $draftIds = array_column($state['drafts'], 'id');
        return ['revision' => $state['revision'], 'nextId' => $state['nextId'],
            'projects' => array_merge($state['drafts'], array_values(array_filter($state['published'], fn($p) => !in_array($p['id'], $draftIds, true)))),
            'draftIds' => $draftIds, 'publishedIds' => array_column($state['published'], 'id')];
    }

    private function exclusive(callable $work): mixed
    {
        $lock = fopen($this->directory . '/state.lock', 'c');
        if ($lock === false) throw new RuntimeException('Lock unavailable');
        try {
            if (!flock($lock, LOCK_EX)) throw new RuntimeException('Lock unavailable');
            return $work($this->load());
        } finally { fclose($lock); }
    }

    public function published(): array { return $this->exclusive(fn($state) => $state['published']); }
    public function get(): array { return $this->exclusive(fn($state) => $this->snapshot($state)); }

    /** A failed SQL delivery remains durable and is retried idempotently on subsequent requests. */
    public function flush(MysqlAuditLog $audit): void
    {
        $this->exclusive(function ($state) use ($audit) {
            if ($state['outbox'] === []) return;
            foreach ($state['outbox'] as $event) $audit->ingest($event);
            $state['outbox'] = [];
            $this->write($this->directory . '/state.json', $state);
        });
    }

    private function image(string $source): string
    {
        if (str_starts_with($source, 'data:')) {
            if (!preg_match('~^data:image/(webp|png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$~D', $source, $match)) throw new ProjectError('INVALID_IMAGE');
            $bytes = base64_decode($match[2], true);
            $size = $bytes === false ? false : @getimagesizefromstring($bytes);
            $mimes = ['webp' => 'image/webp', 'png' => 'image/png', 'jpeg' => 'image/jpeg'];
            if ($bytes === false || strlen($bytes) > 600 * 1024 || $size === false || ($size['mime'] ?? '') !== $mimes[$match[1]]
                || $size[0] < 1 || $size[1] < 1 || $size[0] > 12000 || $size[1] > 12000) throw new ProjectError('INVALID_IMAGE');
            $name = hash('sha256', $bytes) . '.' . ($match[1] === 'jpeg' ? 'jpg' : $match[1]);
            $folder = $this->public . '/images/uploads';
            if (!is_dir($folder) && !mkdir($folder, 0755, true) && !is_dir($folder)) throw new RuntimeException('Uploads unavailable');
            $target = $folder . '/' . $name;
            if (!is_file($target)) {
                $temporary = $folder . '/' . bin2hex(random_bytes(16)) . '.tmp';
                try {
                    if (file_put_contents($temporary, $bytes, LOCK_EX) !== strlen($bytes)) throw new RuntimeException('Upload failed');
                    chmod($temporary, 0644);
                    if (!rename($temporary, $target)) throw new RuntimeException('Upload replacement failed');
                } finally { if (is_file($temporary)) unlink($temporary); }
            }
            return '/images/uploads/' . $name;
        }
        if (!preg_match('~^/images/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g|svg|avif)$~D', $source) || str_contains($source, '..')) throw new ProjectError('INVALID_IMAGE');
        $file = realpath($this->public . $source);
        if ($file === false || !is_file($file)) throw new ProjectError('IMAGE_NOT_FOUND');
        if (!str_starts_with(str_replace('\\', '/', $file), str_replace('\\', '/', $this->public) . '/')) throw new ProjectError('INVALID_IMAGE');
        return $source;
    }

    private function materialize(mixed $input): array
    {
        if (!self::validProject($input)) throw new ProjectError('INVALID_PROJECT');
        $project = array_intersect_key($input, array_flip(self::KEYS));
        $project['image'] = $this->image($project['image']);
        if (isset($project['gallery'])) $project['gallery'] = array_map(fn($image) => $this->image($image), array_values(array_unique($project['gallery'])));
        foreach (['scope', 'scopeTh', 'partners', 'partnersTh'] as $key) {
            if (isset($project[$key])) $project[$key] = array_values(array_filter(array_map('trim', $project[$key]), fn($text) => $text !== ''));
        }
        return $project;
    }

    private function event(int $actor, string $action, array $details, string $result = 'success'): array
    {
        return ['eventId' => newAuditEventId(), 'actorId' => $actor, 'action' => $action, 'result' => $result,
            'createdAt' => gmdate('Y-m-d H:i:s'), 'details' => MysqlAuditLog::safeDetails($details, false)];
    }

    public function failure(int $actor, string $action, string $reason): void
    {
        $this->exclusive(function ($state) use ($actor, $action, $reason) {
            $state['outbox'][] = $this->event($actor, $action, ['reason' => $reason], 'failure');
            $this->write($this->directory . '/state.json', $state);
        });
    }

    public function mutate(string $operation, array $body, int $actor): array
    {
        return $this->exclusive(function ($before) use ($operation, $body, $actor) {
            if (($body['revision'] ?? null) !== $before['revision']) throw new ProjectError('CONFLICT', 409);
            $state = $before; $details = []; $saved = null;
            $all = $this->snapshot($state)['projects'];
            if (in_array($operation, ['save', 'publish'], true)) {
                $saved = $this->materialize($body['project'] ?? null);
                $isNew = ($body['isNew'] ?? false) === true;
                if ($isNew) $saved['id'] = $state['nextId']++;
                elseif (!in_array($saved['id'], array_column($all, 'id'), true)) throw new ProjectError('NOT_FOUND', 404);
                foreach ($all as $other) if ($other['id'] !== $saved['id'] && $other['slug'] === $saved['slug']) throw new ProjectError('DUPLICATE_SLUG', 409);
                $key = $operation === 'publish' ? 'published' : 'drafts';
                $state[$key] = array_merge([$saved], array_values(array_filter($state[$key], fn($p) => $p['id'] !== $saved['id'])));
                if ($operation === 'publish') $state['drafts'] = array_values(array_filter($state['drafts'], fn($p) => $p['id'] !== $saved['id']));
                $uploads = count(array_filter(array_merge([$body['project']['image']], $body['project']['gallery'] ?? []), fn($image) => str_starts_with($image, 'data:')));
                $details = ['projectId' => $saved['id'], 'title' => $saved['title'], 'created' => $isNew, 'uploadCount' => $uploads];
            } elseif (in_array($operation, ['remove', 'unpublish'], true)) {
                $id = $body['id'] ?? null;
                $matches = array_values(array_filter($all, fn($p) => $p['id'] === $id));
                if ($matches === []) throw new ProjectError('NOT_FOUND', 404);
                $wasPublished = array_values(array_filter($state['published'], fn($p) => $p['id'] === $id));
                $state['published'] = array_values(array_filter($state['published'], fn($p) => $p['id'] !== $id));
                if ($operation === 'remove') $state['drafts'] = array_values(array_filter($state['drafts'], fn($p) => $p['id'] !== $id));
                elseif ($wasPublished !== [] && !in_array($id, array_column($state['drafts'], 'id'), true)) array_unshift($state['drafts'], $wasPublished[0]);
                $details = ['projectId' => $id, 'title' => $matches[0]['title']];
            } elseif ($operation === 'migrate') {
                $legacy = $body['projects'] ?? null;
                if (!is_array($legacy) || !array_is_list($legacy) || count($legacy) > 1000) throw new ProjectError('INVALID_PROJECT');
                $hash = hash('sha256', json_encode($legacy, JSON_THROW_ON_ERROR));
                if (in_array($hash, $state['migrations'], true)) return $this->snapshot($state);
                foreach ($legacy as $input) {
                    if (!self::validProject($input)) throw new ProjectError('INVALID_PROJECT');
                    // Browser imports never overwrite server records, even when IDs collide.
                    if (in_array($input['slug'], array_column($all, 'slug'), true)) continue;
                    $project = $this->materialize($input); $project['id'] = $state['nextId']++;
                    array_unshift($state['drafts'], $project); $all[] = $project;
                }
                $state['migrations'][] = $hash; $details = ['migratedCount' => count($legacy)];
            } else throw new ProjectError('NOT_FOUND', 404);
            $slugs = array_column($state['published'], 'slug');
            if (count(array_unique($slugs)) !== count($slugs)) throw new ProjectError('DUPLICATE_SLUG', 409);
            $featured = count(array_filter($state['published'], fn($p) => ($p['featured'] ?? false) === true));
            if ($featured < 3 || $featured > 6) throw new ProjectError('FEATURED_LIMIT');
            $action = match ($operation) { 'save', 'migrate' => 'save_draft', 'remove' => 'delete', default => $operation };
            $state['outbox'][] = $this->event($actor, $action, $details);
            if (($details['uploadCount'] ?? 0) > 0) $state['outbox'][] = $this->event($actor, 'upload', array_intersect_key($details, array_flip(['projectId', 'title', 'uploadCount'])));
            ++$state['revision'];
            $backup = $this->directory . '/backups';
            if (!is_dir($backup) && !mkdir($backup, 0700) && !is_dir($backup)) throw new RuntimeException('Backup unavailable');
            $this->write($backup . '/' . $before['revision'] . '-' . bin2hex(random_bytes(6)) . '.json', $before);
            $this->write($this->directory . '/state.json', $state);
            $result = $this->snapshot($state);
            if ($saved !== null) $result['project'] = $saved;
            return $result;
        });
    }
}
