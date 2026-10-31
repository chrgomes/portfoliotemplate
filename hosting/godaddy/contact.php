<?php
/**
 * Contact form handler for GoDaddy (or any PHP host). Self-hosted: no outside services.
 * Requires PHP 8.0 or newer (cPanel > Select PHP Version).
 *
 * Settings live OUTSIDE the public folder, in:
 *   ~/portfolio-private/contact-config.php   (a sibling of public_html)
 * Copy contact-config.example.php there and fill it in. Nothing secret is in this file.
 *
 *   GET  contact.php?action=challenge   -> a signed, short-lived proof-of-work challenge
 *   POST contact.php                    -> send a message
 *
 * Layers of protection, cheapest first:
 *   1. POST only, same-origin check
 *   2. Honeypot field and minimum fill time (bots are dropped silently)
 *   3. Strict validation and email-header-injection stripping
 *   4. Proof of work: the browser must solve a challenge this server signed. Each
 *      challenge expires and works once, so bots can't skip the page or replay it.
 *      The format matches ALTCHA (https://altcha.org), so its official widget can be
 *      swapped in later without changing this file.
 *   5. Content filter: too many links, links in the name, spam phrases, repeated messages
 *   6. Rate limit per visitor (IP addresses are stored only as salted hashes; an IPv6
 *      visitor's whole /64 block counts as one visitor)
 *   7. Block list of addresses or ranges you choose, in contact-config.php
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
            . "<title>Contact</title><body style='font-family:system-ui;background:#101a33;color:#f4f6fa;padding:3rem 1.5rem;max-width:40rem;margin:auto'>"
            . "<p>{$safe}</p><p><a style='color:#5b8cff' href='/#contact'>Back to the site</a></p></body>";
    }
    exit;
}

/** Read a small JSON state file, drop expired entries, apply $update, write it back — under one lock. */
function with_state(string $file, int $now, callable $update)
{
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return $update([])[0];
    }
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $state = array_filter((array)json_decode($raw ?: '[]', true), static fn($exp) => is_int($exp) && $exp > $now);
    [$result, $state] = $update($state);
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($state));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return $result;
}

/** How long a spam-check challenge stays valid. */
const CHALLENGE_LIFETIME = 1800;
/** A real person takes longer than this between getting a challenge and sending. */
const MIN_FILL_SECONDS = 2;

const NOT_CONFIGURED = 'The contact form isn’t set up yet. Please use the email link instead.';

// ---- Configuration -------------------------------------------------------------
$configFile = getenv('PORTFOLIO_CONTACT_CONFIG') ?: dirname(__DIR__) . '/portfolio-private/contact-config.php';
if (!is_readable($configFile)) {
    error_log('contact.php: missing config at ' . $configFile);
    respond(500, false, NOT_CONFIGURED, $wantsJson);
}
$config = require $configFile;
$to = (string)($config['to_email'] ?? '');
$from = (string)($config['from_email'] ?? '');
$allowedOrigins = (array)($config['allowed_origins'] ?? []);
$maxPerHour = (int)($config['max_per_hour'] ?? 5);
$storage = (string)($config['storage_dir'] ?? dirname(__DIR__) . '/portfolio-private/contact-data');
$mode = (string)($config['mode'] ?? 'mail');
$hmacKey = (string)($config['challenge_key'] ?? '');
$difficulty = max(1000, (int)($config['challenge_difficulty'] ?? 50000));
$maxLinks = (int)($config['max_links'] ?? 2);
$filteredRetentionDays = max(1, (int)($config['filtered_retention_days'] ?? 30));
$spamPhrases = array_map('strtolower', (array)($config['spam_phrases'] ?? []));
$now = time();

if (strlen($hmacKey) < 32) {
    error_log('contact.php: challenge_key must be a random string of at least 32 characters');
    respond(500, false, NOT_CONFIGURED, $wantsJson);
}
if (!is_dir($storage) && !@mkdir($storage, 0700, true)) {
    error_log('contact.php: cannot create storage dir ' . $storage);
    respond(500, false, 'The message couldn’t be sent. Please use the email link instead.', $wantsJson);
}

// ---- Housekeeping: delete stored data once it's no longer needed --------------------
// Rate-limit files after a day, filtered-message logs after filtered_retention_days.
// Runs on about 1 in 20 requests so it costs nothing noticeable.
if (random_int(1, 20) === 1) {
    foreach (glob($storage . '/rate-*.json') ?: [] as $f) {
        if (@filemtime($f) < $now - 86400) @unlink($f);
    }
    foreach (glob($storage . '/filtered-*.log') ?: [] as $f) {
        if (@filemtime($f) < $now - $filteredRetentionDays * 86400) @unlink($f);
    }
}

// ---- Same-origin check -----------------------------------------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && $allowedOrigins && !in_array(rtrim($origin, '/'), $allowedOrigins, true)) {
    respond(403, false, 'This form only accepts messages sent from the website.', $wantsJson);
}

// ---- Issue a challenge ------------------------------------------------------------
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET' && ($_GET['action'] ?? '') === 'challenge') {
    $expires = $now + CHALLENGE_LIFETIME; // time to fill in the form
    $salt = bin2hex(random_bytes(12)) . '?expires=' . $expires;
    $number = random_int(0, $difficulty);
    $challenge = hash('sha256', $salt . $number);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'algorithm' => 'SHA-256',
        'challenge' => $challenge,
        'maxnumber' => $difficulty,
        'salt' => $salt,
        'signature' => hash_hmac('sha256', $challenge, $hmacKey),
    ]);
    exit;
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, false, 'Use the form on the contact section to send a message.', $wantsJson);
}

/** Binary form of an address; IPv4-mapped IPv6 (::ffff:1.2.3.4) becomes plain IPv4. */
function ip_bin(string $ip): ?string
{
    $bin = @inet_pton(trim($ip));
    if ($bin === false) {
        return null;
    }
    if (strlen($bin) === 16 && substr($bin, 0, 12) === str_repeat("\0", 10) . "\xff\xff") {
        return substr($bin, 12);
    }
    return $bin;
}

/**
 * The address the rate limit counts by. IPv4 as-is; IPv6 reduced to its /64 block, because
 * one home or mobile connection usually gets a whole /64 and could otherwise rotate
 * through addresses to dodge the limit.
 */
function visitor_id(string $ip): string
{
    $bin = ip_bin($ip);
    if ($bin === null) {
        return $ip;
    }
    return strlen($bin) === 16
        ? inet_ntop(substr($bin, 0, 8) . str_repeat("\0", 8)) . '/64'
        : (string)inet_ntop($bin);
}

/** Whether $ip matches an entry like "203.0.113.7", "203.0.113.0/24" or "2001:db8::/32". */
function ip_matches(string $ip, string $rule): bool
{
    [$net, $bits] = array_pad(explode('/', trim($rule), 2), 2, null);
    $ipBin = ip_bin($ip);
    $netBin = ip_bin((string)$net);
    if ($ipBin === null || $netBin === null || strlen($ipBin) !== strlen($netBin)) {
        return false;
    }
    $max = strlen($ipBin) * 8;
    if ($bits !== null && !ctype_digit($bits)) {
        return false;
    }
    $bits = $bits === null ? $max : (int)$bits;
    if ($bits > $max) {
        return false;
    }
    $bytes = intdiv($bits, 8);
    if (substr($ipBin, 0, $bytes) !== substr($netBin, 0, $bytes)) {
        return false;
    }
    $rest = $bits % 8;
    if ($rest === 0) {
        return true;
    }
    $mask = (0xff << (8 - $rest)) & 0xff;
    return (ord($ipBin[$bytes]) & $mask) === (ord($netBin[$bytes]) & $mask);
}

/** A posted field as a string; anything else (e.g. name[]=x) counts as empty. */
function field(string $key): string
{
    $v = $_POST[$key] ?? '';
    return is_string($v) ? $v : '';
}

// ---- Block list (fail silently: the sender sees "sent", nothing is delivered) ---------
$ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
foreach ((array)($config['blocked_ips'] ?? []) as $rule) {
    if (is_string($rule) && $rule !== '' && ip_matches($ip, $rule)) {
        respond(200, true, 'Message sent.', $wantsJson);
    }
}

// ---- Bot checks (fail silently so bots learn nothing) -------------------------------
$honeypot = trim(field('website'));
$started = (int)field('started');
$elapsedMs = $started > 0 ? (int)(microtime(true) * 1000) - $started : null;
if ($honeypot !== '' || ($elapsedMs !== null && $elapsedMs >= 0 && $elapsedMs < 2000)) {
    respond(200, true, 'Message sent.', $wantsJson);
}

// ---- Validation -----------------------------------------------------------------
$clean = static fn(string $s): string => trim(str_replace(["\r", "\n", "\0"], ' ', $s));
$name = $clean(field('name'));
$email = $clean(field('email'));
$message = trim(str_replace("\0", '', field('message')));

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

// ---- Proof of work ------------------------------------------------------------------
$solved = json_decode((string)base64_decode(field('altcha'), true), true);
$powOk = is_array($solved)
    && ($solved['algorithm'] ?? '') === 'SHA-256'
    && is_string($solved['challenge'] ?? null)
    && is_string($solved['salt'] ?? null)
    && is_string($solved['signature'] ?? null)
    && is_int($solved['number'] ?? null);
if ($powOk) {
    parse_str(explode('?', $solved['salt'], 2)[1] ?? '', $params);
    $expires = (int)($params['expires'] ?? 0);
    $powOk = $expires > $now
        && hash_equals($solved['challenge'], hash('sha256', $solved['salt'] . $solved['number']))
        && hash_equals(hash_hmac('sha256', $solved['challenge'], $hmacKey), $solved['signature']);
}
if (!$powOk) {
    respond(400, false, 'The spam check didn’t complete. Reload the page and try again.', $wantsJson);
}
// Too fast to be a person. Unlike the browser's `started` field, the challenge's issue
// time is signed by this server, so a bot can't fake it. Dropped quietly.
if ($now - ($expires - CHALLENGE_LIFETIME) < MIN_FILL_SECONDS) {
    respond(200, true, 'Message sent.', $wantsJson);
}
// ---- Content filter -------------------------------------------------------------------
$linkPattern = '~(https?://|www\.)~i';
if (preg_match($linkPattern, $name)) {
    respond(422, false, 'Your name can’t contain a web address.', $wantsJson);
}
if (preg_match_all($linkPattern, $message) > $maxLinks) {
    respond(422, false, "Messages can include at most {$maxLinks} links. Remove some, or email me directly.", $wantsJson);
}

// Each challenge works once.
$fresh = with_state($storage . '/used-challenges.json', $now, static function (array $used) use ($solved, $expires) {
    $key = hash('sha256', $solved['signature']);
    if (isset($used[$key])) {
        return [false, $used];
    }
    $used[$key] = $expires;
    return [true, $used];
});
if (!$fresh) {
    respond(400, false, 'This form was already sent. Reload the page to send another message.', $wantsJson);
}

// One log file per month; files older than filtered_retention_days are deleted (see cleanup below).
$filteredLog = $storage . '/filtered-' . date('Y-m', $now) . '.log';
$keep = static function (string $reason) use ($filteredLog, $name, $email, $message, $now): void {
    // Kept privately so a real message caught by mistake isn't lost. Review it now and then.
    @file_put_contents($filteredLog, date('c', $now) . " [{$reason}] {$name} <{$email}>\n{$message}\n-----\n", FILE_APPEND | LOCK_EX);
};
$haystack = strtolower($name . ' ' . $message);
foreach ($spamPhrases as $phrase) {
    if ($phrase !== '' && str_contains($haystack, $phrase)) {
        $keep('phrase: ' . $phrase);
        respond(200, true, 'Message sent.', $wantsJson);
    }
}

// The same message twice within a day is dropped quietly.
$fingerprint = hash('sha256', strtolower(preg_replace('/\s+/', ' ', $message)));
$recentFile = $storage . '/recent-messages.json';
$repeat = with_state($recentFile, $now, static fn(array $seen) => [isset($seen[$fingerprint]), $seen]);
if ($repeat) {
    $keep('duplicate');
    respond(200, true, 'Message sent.', $wantsJson);
}

// ---- Rate limit (per visitor) ---------------------------------------------------------
$key = hash('sha256', visitor_id($ip !== '' ? $ip : 'unknown') . '|' . (string)($config['salt'] ?? 'portfolio'));
$rateFile = $storage . '/rate-' . $key . '.json';
$hits = [];
if (is_readable($rateFile)) {
    $hits = array_values(array_filter((array)json_decode((string)file_get_contents($rateFile), true), static fn($t) => is_int($t) && $t > $now - 3600));
}
if (count($hits) >= $maxPerHour) {
    respond(429, false, 'Too many messages from your connection in the last hour. Please try again later or email me directly.', $wantsJson);
}

// ---- Send ---------------------------------------------------------------------------
if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
    error_log('contact.php: to_email or from_email is not a valid address');
    respond(500, false, NOT_CONFIGURED, $wantsJson);
}
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
// Remember the message only once it has actually gone out, so a failed send can be retried.
with_state($recentFile, $now, static function (array $seen) use ($fingerprint, $now) {
    $seen[$fingerprint] = $now + 86400;
    return [null, $seen];
});

respond(200, true, 'Message sent. I’ll reply to the email address you gave.', $wantsJson);
