<?php

declare(strict_types=1);

/* =========================================================
   PRIVORA — CONTACT FORM HANDLER
   Digital Privacy & Online Security

   Features:
   - POST only
   - JSON responses
   - server-side validation
   - honeypot spam protection
   - no phone fields
   - no mbstring dependency
   - recipient email is read from config/config.js
   ========================================================= */


/* =========================================================
   01. RESPONSE HEADERS
   ========================================================= */

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');


/* =========================================================
   02. RESPONSE HELPER
   ========================================================= */

function respond(
    bool $success,
    string $message,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode(
        [
            'success' => $success,
            'message' => $message
        ],
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}


/* =========================================================
   03. METHOD CHECK
   ========================================================= */

if (
    !isset($_SERVER['REQUEST_METHOD']) ||
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {
    header('Allow: POST');

    respond(
        false,
        'Method not allowed.',
        405
    );
}


/* =========================================================
   04. READ RECIPIENT FROM config/config.js
   ---------------------------------------------------------
   This keeps the website email in ONE place.

   config/config.js:

   email: "hello@privora-security.com",
   ========================================================= */

function getRecipientEmail(): ?string
{
    $configPath =
        __DIR__ . '/config/config.js';

    if (!is_file($configPath)) {
        return null;
    }

    $configContents =
        @file_get_contents($configPath);

    if (
        $configContents === false ||
        $configContents === ''
    ) {
        return null;
    }

    $matched = preg_match(
        '/\bemail\s*:\s*["\']([^"\']+)["\']/i',
        $configContents,
        $matches
    );

    if (
        $matched !== 1 ||
        empty($matches[1])
    ) {
        return null;
    }

    $email = trim($matches[1]);

    if (
        filter_var(
            $email,
            FILTER_VALIDATE_EMAIL
        ) === false
    ) {
        return null;
    }

    return $email;
}


$recipientEmail =
    getRecipientEmail();


if ($recipientEmail === null) {
    respond(
        false,
        'The contact form is temporarily unavailable.',
        500
    );
}


/* =========================================================
   05. INPUT HELPERS
   ========================================================= */

function postString(string $key): string
{
    if (
        !isset($_POST[$key]) ||
        is_array($_POST[$key])
    ) {
        return '';
    }

    return trim(
        (string) $_POST[$key]
    );
}


function cleanSingleLine(string $value): string
{
    /*
     Remove CR/LF to protect email headers.
    */

    $value = str_replace(
        ["\r", "\n"],
        ' ',
        $value
    );

    /*
     Collapse repeated whitespace.
    */

    $cleaned = preg_replace(
        '/[ \t]+/u',
        ' ',
        $value
    );

    if ($cleaned !== null) {
        $value = $cleaned;
    }

    return trim($value);
}


function textLength(string $value): int
{
    /*
     UTF-8 character count without mbstring.
    */

    $count = preg_match_all(
        '/./us',
        $value,
        $matches
    );

    if ($count === false) {
        return strlen($value);
    }

    return $count;
}


/* =========================================================
   06. HONEYPOT
   ---------------------------------------------------------
   Real users never see/fill this field.
   ========================================================= */

$honeypot =
    postString('website');


if ($honeypot !== '') {
    /*
     Silent success prevents bots from learning
     that the honeypot blocked the submission.
    */

    respond(
        true,
        'Thank you. Your message has been successfully sent.'
    );
}


/* =========================================================
   07. COLLECT FIELDS
   ========================================================= */

$name =
    cleanSingleLine(
        postString('name')
    );


$email =
    cleanSingleLine(
        postString('email')
    );


$subject =
    cleanSingleLine(
        postString('subject')
    );


$message =
    postString('message');


/*
 Phone numbers are intentionally not accepted
 or processed by this website.
*/

unset(
    $_POST['phone'],
    $_POST['telephone'],
    $_POST['tel'],
    $_POST['mobile']
);


/* =========================================================
   08. REQUIRED FIELD VALIDATION
   ========================================================= */

if (
    $name === '' ||
    $email === '' ||
    $subject === '' ||
    $message === ''
) {
    respond(
        false,
        'Please complete all required fields.',
        422
    );
}


/* =========================================================
   09. LENGTH VALIDATION
   ========================================================= */

if (
    textLength($name) < 2 ||
    textLength($name) > 100
) {
    respond(
        false,
        'Please enter a valid name.',
        422
    );
}


if (
    textLength($email) > 180
) {
    respond(
        false,
        'Please enter a valid email address.',
        422
    );
}


if (
    textLength($subject) < 2 ||
    textLength($subject) > 160
) {
    respond(
        false,
        'Please enter a valid subject.',
        422
    );
}


if (
    textLength($message) < 10 ||
    textLength($message) > 3000
) {
    respond(
        false,
        'Your message must contain between 10 and 3000 characters.',
        422
    );
}


/* =========================================================
   10. EMAIL VALIDATION
   ========================================================= */

if (
    filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    ) === false
) {
    respond(
        false,
        'Please enter a valid email address.',
        422
    );
}


/* =========================================================
   11. REMOVE CONTROL CHARACTERS
   ========================================================= */

$nameSafe = preg_replace(
    '/[\x00-\x1F\x7F]/u',
    '',
    $name
);


$subjectSafe = preg_replace(
    '/[\x00-\x1F\x7F]/u',
    '',
    $subject
);


if ($nameSafe !== null) {
    $name = trim($nameSafe);
}


if ($subjectSafe !== null) {
    $subject = trim($subjectSafe);
}


/* =========================================================
   12. DETERMINE SAFE SENDER DOMAIN
   ---------------------------------------------------------
   We do NOT use the visitor's address as From,
   because many servers reject that because of SPF/DMARC.

   Visitor email goes into Reply-To instead.
   ========================================================= */

function getSenderAddress(): string
{
    $host =
        $_SERVER['HTTP_HOST'] ?? '';

    /*
     Remove port if present.
    */

    $host = preg_replace(
        '/:\d+$/',
        '',
        $host
    );

    if ($host === null) {
        $host = '';
    }

    $host = strtolower(
        trim($host)
    );


    /*
     Remove a possible www prefix.
    */

    if (
        str_starts_with(
            $host,
            'www.'
        )
    ) {
        $host =
            substr(
                $host,
                4
            );
    }


    /*
     Only use a normal hostname.
    */

    if (
        $host !== '' &&
        preg_match(
            '/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i',
            $host
        )
    ) {
        return 'no-reply@' . $host;
    }


    /*
     Development fallback.
    */

    return 'no-reply@localhost';
}


$senderEmail =
    getSenderAddress();


/* =========================================================
   13. BUILD EMAIL SUBJECT
   ========================================================= */

$mailSubject =
    'Website contact: ' .
    $subject;


/* =========================================================
   14. OPTIONAL REQUEST INFORMATION
   ========================================================= */

$page =
    $_SERVER['HTTP_REFERER'] ?? 'Unknown';


$sentAt =
    gmdate(
        'Y-m-d H:i:s'
    ) . ' UTC';


/* =========================================================
   15. BUILD EMAIL BODY
   ========================================================= */

$mailBody =
    "New message from the website\n" .
    "========================================\n\n" .

    "Name:\n" .
    $name . "\n\n" .

    "Email:\n" .
    $email . "\n\n" .

    "Subject:\n" .
    $subject . "\n\n" .

    "Message:\n" .
    $message . "\n\n" .

    "----------------------------------------\n" .

    "Submitted:\n" .
    $sentAt . "\n\n" .

    "Page:\n" .
    $page . "\n";


/* =========================================================
   16. EMAIL HEADERS
   ========================================================= */

$headers = [
    'MIME-Version: 1.0',

    'Content-Type: text/plain; charset=UTF-8',

    'From: Website Contact <' .
        $senderEmail .
        '>',

    'Reply-To: ' .
        $email,

    'X-Mailer: PHP/' .
        PHP_VERSION
];


/* =========================================================
   17. SEND EMAIL
   ========================================================= */

$mailSent = @mail(
    $recipientEmail,
    $mailSubject,
    $mailBody,
    implode(
        "\r\n",
        $headers
    )
);


/* =========================================================
   18. RESULT
   ========================================================= */

if (!$mailSent) {
    respond(
        false,
        'Your message could not be sent right now. Please try again later.',
        500
    );
}


respond(
    true,
    'Thank you. Your message has been successfully sent.'
);
