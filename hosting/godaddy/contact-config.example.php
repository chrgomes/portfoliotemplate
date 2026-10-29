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

    // Folder for rate-limit files (created automatically, outside public_html).
    'storage_dir' => __DIR__ . '/contact-data',

    // 'mail' sends email. 'log' writes messages to contact-data/outbox.log instead (for testing).
    'mode' => 'mail',
];
