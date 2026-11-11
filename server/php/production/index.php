<?php
declare(strict_types=1);

// The entire private application is a sibling of httpdocs, never inside it.
define('ESI_ADMIN_PUBLIC_ROOT', dirname(__DIR__));
$private = dirname(__DIR__, 2) . '/.esi-admin-production';
putenv('ESI_ADMIN_CONFIG=' . $private . '/config.php');
ini_set('display_errors', '0');
if (!is_file($private . '/src/ProductionHttp.php')) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo '{"error":"CONFIGURATION_ERROR"}';
    exit;
}
require $private . '/src/ProductionHttp.php';
\Esi\Admin\handleProductionHttp();
