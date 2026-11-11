<?php
declare(strict_types=1);

// Never return false: PHP's development server must not serve arbitrary files.
require_once __DIR__ . '/../src/Http.php';
\Esi\Admin\handleAuthHttp();
