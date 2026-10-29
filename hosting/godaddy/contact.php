<?php
/**
 * Contact form handler for GoDaddy (or any PHP host).
 *
 * Settings live OUTSIDE the public folder, in:
 *   ~/portfolio-private/contact-config.php   (a sibling of public_html)
 * Copy contact-config.example.php there and fill it in. Nothing secret is in this file.
 *
 * Protections: POST only, same-origin check, honeypot field, minimum fill time,
 * per-visitor rate limit, strict validation and header-injection stripping.
 */

declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

/** Send the result as JSON (JavaScript) or a small page (no JavaScript). */
function respond(int $status, bool $ok, string $message, bool $json): void
{
    http_response_code($status);
    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        echo "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
            . "<title>Contact</title><body style='font-family:system-ui;background:#080b12;color:#f4f6fa;padding:3rem 1.5rem;max-width:40rem;margin:auto'>"
            . "<p>{$safe}</p><p><a style='color:#5b8cff' href='/#contact'>Back to the site</a></p></body>";
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Use the form on the contact section to send a message.', $wantsJson);
}

// ---- Configuration -------------------------------------------------------------
$configFile = getenv('PORTFOLIO_CONTACT_CONFIG') ?: dirname(__DIR__) . '/portfolio-private/contact-config.php';
if (!is_readable($configFile)) {
    error_log('contact.php: missing config at ' . $configFile);
    respond(500, false, 'The contact form isn’t set up yet. Please use the email link instead.', $wantsJson);
}
$config = require $configFile;
$to = (string)($config['to_email'] ?? '');
$from = (string)($config['from_email'] ?? '');
$allowedOrigins = (array)($config['allowed_origins'] ?? []);
$maxPerHour = (int)($config['max_per_hour'] ?? 5);
$storage = (string)($config['storage_dir'] ?? dirname(__DIR__) . '/portfolio-private/contact-data');
$mode = (string)($config['mode'] ?? 'mail');

if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
    error_log('contact.php: to_email or from_email is not a valid address');
    respond(500, false, 'The contact form isn’t set up yet. Please use the email link instead.', $wantsJson);
}

// ---- Same-origin check -----------------------------------------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && $allowedOrigins && !in_array(rtrim($origin, '/'), $allowedOrigins, true)) {
    respond(403, false, 'This form only accepts messages sent from the website.', $wantsJson);
}

// ---- Bot checks (fail silently so bots learn nothing) -------------------------------
$honeypot = trim((string)($_POST['website'] ?? ''));
$started = (int)($_POST['started'] ?? 0);
$elapsedMs = $started > 0 ? (int)(microtime(true) * 1000) - $started : null;
if ($honeypot !== '' || ($elapsedMs !== null && $elapsedMs >= 0 && $elapsedMs < 2000)) {
    respond(200, true, 'Message sent.', $wantsJson);
}

// ---- Validation -----------------------------------------------------------------
$clean = static fn(string $s): string => trim(str_replace(["\r", "\n", "\0"], ' ', $s));
$name = $clean((string)($_POST['name'] ?? ''));
$email = $clean((string)($_POST['email'] ?? ''));
$message = trim(str_replace("\0", '', (string)($_POST['message'] ?? '')));

$len = static fn(string $s): int => function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
if ($len($name) < 2 || $len($name) > 100) {
    respond(422, false, 'Enter your name (2 to 100 characters).', $wantsJson);
}
if (strlen($email) > 200 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, false, 'Enter a valid email address so I can reply.', $wantsJson);
}
if ($len($message) < 10 || $len($message) > 5000) {
    respond(422, false, 'Write a message between 10 and 5,000 characters.', $wantsJson);
}

// ---- Rate limit (per visitor, stored outside the public folder) ---------------------
if (!is_dir($storage) && !@mkdir($storage, 0700, true)) {
    error_log('contact.php: cannot create storage dir ' . $storage);
    respond(500, false, 'The message couldn’t be sent. Please use the email link instead.', $wantsJson);
}
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$key = hash('sha256', $ip . '|' . (string)($config['salt'] ?? 'portfolio'));
$rateFile = $storage . '/rate-' . $key . '.json';
$now = time();
$hits = [];
if (is_readable($rateFile)) {
    $hits = array_values(array_filter((array)json_decode((string)file_get_contents($rateFile), true), static fn($t) => is_int($t) && $t > $now - 3600));
}
if (count($hits) >= $maxPerHour) {
    respond(429, false, 'Too many messages from your connection in the last hour. Please try again later or email me directly.', $wantsJson);
}

// ---- Send ---------------------------------------------------------------------------
$site = $clean((string)($config['site_name'] ?? 'Portfolio'));
$subjectName = function_exists('mb_substr') ? mb_substr($name, 0, 60, 'UTF-8') : substr($name, 0, 60);
$subject = '=?UTF-8?B?' . base64_encode("New message via {$site}: {$subjectName}") . '?=';
$body = "Name: {$name}\nEmail: {$email}\n\n{$message}\n\n--\nSent from the contact form at {$site}.";
$headers = implode("\r\n", [
    "From: {$site} <{$from}>",
    "Reply-To: {$email}",
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: portfolio-contact',
]);

if ($mode === 'log') {
    // For testing: write the message to a file instead of emailing it.
    $sent = file_put_contents($storage . '/outbox.log', "To: {$to}\nSubject: {$subject}\n{$headers}\n\n{$body}\n\n=====\n", FILE_APPEND | LOCK_EX) !== false;
} else {
    $sent = mail($to, $subject, $body, $headers, '-f' . $from);
}

if (!$sent) {
    error_log('contact.php: mail() failed');
    respond(502, false, 'The message couldn’t be sent. Please try again, or use the email link instead.', $wantsJson);
}

$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

respond(200, true, 'Message sent. I’ll reply to the email address you gave.', $wantsJson);
