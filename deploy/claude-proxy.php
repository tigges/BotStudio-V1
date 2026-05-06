<?php
/**
 * BotStudio — Claude + Gemini API proxy (PHP / Cloudways)
 *
 * Deploy to Cloudways:
 *   1. Upload this file to your WordPress public root via SFTP
 *      e.g. /var/www/html/botstudio-proxy.php
 *   2. Set your API keys in the KEYS block below
 *   3. Access URL will be: https://your-cloudways-domain.com/botstudio-proxy.php
 *   4. Paste that URL into BotStudio Settings → Proxy URL
 *
 * Security: restrict ALLOWED_ORIGIN to your GitHub Pages domain in production.
 */

/* ─── Configuration ──────────────────────────────────────────────────────── */
define('ANTHROPIC_API_KEY', getenv('ANTHROPIC_API_KEY') ?: 'sk-ant-YOUR_KEY_HERE');
define('GEMINI_API_KEY',    getenv('GEMINI_API_KEY')    ?: 'AIza-YOUR_KEY_HERE');
define('ALLOWED_ORIGIN',    '*'); // or 'https://tigges.github.io'

/* ─── CORS ───────────────────────────────────────────────────────────────── */
header('Access-Control-Allow-Origin: '    . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-provider');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

/* ─── Route by provider ──────────────────────────────────────────────────── */
$provider = $_SERVER['HTTP_X_PROVIDER'] ?? 'claude';
$body     = file_get_contents('php://input');
$decoded  = json_decode($body, true);

if ($provider === 'gemini') {
    $model = $decoded['model'] ?? 'gemini-2.0-flash';
    unset($decoded['model']);
    $url     = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . GEMINI_API_KEY;
    $headers = ['Content-Type: application/json'];
    $payload = json_encode($decoded);
} else {
    $url     = 'https://api.anthropic.com/v1/messages';
    $headers = [
        'Content-Type: application/json',
        'x-api-key: '          . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ];
    $payload = $body;
}

/* ─── cURL call ──────────────────────────────────────────────────────────── */
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => $headers,
    CURLOPT_TIMEOUT        => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(502);
    echo json_encode(['error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);
http_response_code($httpCode);
echo $response;
