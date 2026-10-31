<?php
/**
 * Contact form settings. DO NOT upload this into public_html.
 *
 * On GoDaddy cPanel, create a folder next to public_html called "portfolio-private"
 * and save a copy of this file there as contact-config.php:
 *
 *   /home/<cpanel-user>/public_html/                       <- the website
 *   /home/<cpanel-user>/portfolio-private/contact-config.php  <- this file
 */
return [
    // Where messages are delivered. Any inbox you read.
    'to_email' => 'you@example.com',

    // The sender address. Use a mailbox on YOUR domain (create it in cPanel > Email Accounts),
    // otherwise many inboxes will mark the message as spam.
    'from_email' => 'website@yourdomain.com',

    // Shown in the subject line.
    'site_name' => 'yourdomain.com',

    // Your site's address(es), no trailing slash. Requests from anywhere else are refused.
    'allowed_origins' => ['https://www.yourdomain.com', 'https://yourdomain.com'],

    // Messages allowed per visitor per hour.
    'max_per_hour' => 5,

    // Any random string; used to anonymise visitors' IP addresses in the rate-limit files.
    'salt' => 'replace-with-a-long-random-string',

    // Signs the spam-check challenges. At least 32 random characters, different from 'salt'.
    // Generate one at https://www.random.org/strings/ or run: php -r "echo bin2hex(random_bytes(32));"
    'challenge_key' => 'replace-with-at-least-32-random-characters',

    // How much work each visitor's browser does (about 0.1-1 second on a phone at 50000).
    // Raise it if spam still gets through; lower it if real visitors find sending slow.
    'challenge_difficulty' => 50000,

    // Messages with more links than this are refused with an explanation.
    'max_links' => 2,

    // Messages containing any of these (case-insensitive) are dropped quietly and saved to
    // contact-data/filtered-YYYY-MM.log so a real message caught by mistake isn't lost.
    // Filtered-message logs are deleted after this many days. Keep it in line with the
    // privacy notice (src/content/privacy.ts says 30 days).
    'filtered_retention_days' => 30,

    'spam_phrases' => [
        'backlinks', 'guest post', 'seo services', 'rank your website', 'first page of google',
        'increase your traffic', 'web traffic', 'casino', 'crypto investment', 'forex',
        'viagra', 'loan offer', 'buy followers', 'whatsapp me',
    ],

    // Folder for rate-limit files (created automatically, outside public_html).
    'storage_dir' => __DIR__ . '/contact-data',

    // 'mail' sends email. 'log' writes messages to contact-data/outbox.log instead (for testing).
    'mode' => 'mail',
];
