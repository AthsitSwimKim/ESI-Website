<?php
declare(strict_types=1);

namespace Esi\Admin;

use RuntimeException;

final class RateLimiter
{
    public function __construct(private string $directory, private string $key) {}

    /** Reserve an attempt atomically, including in concurrent PHP workers. */
    public function consume(string $username, string $address, int $now): int
    {
        $buckets = [
            ['ip:' . $address, 30],
            ['user:' . strtolower($username), 10],
            ['pair:' . strtolower($username) . ':' . $address, 5],
        ];
        return $this->mutate(function (array &$state) use ($buckets, $now): int {
            foreach ($state as $id => $value) {
                if (!is_array($value) || ($value['expires'] ?? 0) <= $now) {
                    unset($state[$id]);
                }
            }
            $retry = 0;
            foreach ($buckets as [$label, $limit]) {
                $id = hash_hmac('sha256', $label, $this->key);
                if (($state[$id]['count'] ?? 0) >= $limit) {
                    $retry = max($retry, $state[$id]['expires'] - $now);
                }
            }
            if ($retry > 0) {
                return $retry;
            }
            foreach ($buckets as [$label]) {
                $id = hash_hmac('sha256', $label, $this->key);
                $state[$id] ??= ['count' => 0, 'expires' => $now + 900];
                $state[$id]['count']++;
            }
            return 0;
        });
    }

    public function clearSuccessfulUser(string $username, string $address): void
    {
        $this->mutate(function (array &$state) use ($username, $address): int {
            foreach (['user:' . strtolower($username), 'pair:' . strtolower($username) . ':' . $address] as $label) {
                unset($state[hash_hmac('sha256', $label, $this->key)]);
            }
            return 0;
        });
    }

    private function mutate(callable $operation): int
    {
        $filename = $this->directory . DIRECTORY_SEPARATOR . 'login-rate-limits.json';
        $handle = fopen($filename, 'c+');
        if ($handle === false || !flock($handle, LOCK_EX)) {
            if (is_resource($handle)) {
                fclose($handle);
            }
            throw new RuntimeException('Rate limit storage unavailable');
        }
        try {
            $contents = stream_get_contents($handle);
            $state = $contents === '' ? [] : json_decode((string) $contents, true, 32, JSON_THROW_ON_ERROR);
            if (!is_array($state)) {
                throw new RuntimeException('Rate limit storage invalid');
            }
            $result = $operation($state);
            $encoded = json_encode($state, JSON_THROW_ON_ERROR);
            rewind($handle);
            if (!ftruncate($handle, 0) || fwrite($handle, $encoded) !== strlen($encoded) || !fflush($handle)) {
                throw new RuntimeException('Rate limit storage unavailable');
            }
            return $result;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }
}
