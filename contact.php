<?php

declare(strict_types=1);




















header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');






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
        '/(?:^|[,{]\s*)["\']?email["\']?\s*:\s*["\']([^"\']+)["\']/i',
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


function stringStartsWith(string $value, string $prefix): bool
{
    return substr(
        $value,
        0,
        strlen($prefix)
    ) === $prefix;
}


function mimeEncodeHeaderUtf8(string $value): string
{
    $value = str_replace(
        ["\r", "\n"],
        ' ',
        $value
    );

    $chunks = [];
    $chunk = '';
    $chunkBytes = 0;
    $length = strlen($value);
    $offset = 0;
    $maxChunkBytes = 45;

    while ($offset < $length) {
        $byte = ord($value[$offset]);
        $charBytes = 1;

        if (($byte & 0x80) === 0x00) {
            $charBytes = 1;
        } elseif (($byte & 0xE0) === 0xC0) {
            $charBytes = 2;
        } elseif (($byte & 0xF0) === 0xE0) {
            $charBytes = 3;
        } elseif (($byte & 0xF8) === 0xF0) {
            $charBytes = 4;
        }

        if ($offset + $charBytes > $length) {
            $charBytes = 1;
        }

        $char = substr(
            $value,
            $offset,
            $charBytes
        );

        if (
            $chunk !== '' &&
            $chunkBytes + $charBytes > $maxChunkBytes
        ) {
            $chunks[] = $chunk;
            $chunk = '';
            $chunkBytes = 0;
        }

        $chunk .= $char;
        $chunkBytes += $charBytes;
        $offset += $charBytes;
    }

    if ($chunk !== '') {
        $chunks[] = $chunk;
    }

    foreach ($chunks as $index => $chunkValue) {
        $chunks[$index] =
            '=?UTF-8?B?' .
            base64_encode($chunkValue) .
            '?=';
    }

    return implode(
        ' ',
        $chunks
    );
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
    



    $value = str_replace(
        ["\r", "\n"],
        ' ',
        $value
    );

    



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








$honeypot =
    postString('website');


if ($honeypot !== '') {
    




    respond(
        true,
        'Thank you. Your message has been successfully sent.'
    );
}






$name =
    cleanSingleLine(
        postString('name')
    );


$email =
    cleanSingleLine(
        postString('email')
    );


$company =
    cleanSingleLine(
        postString('company')
    );


$subject =
    cleanSingleLine(
        postString('subject')
    );


$message =
    postString('message');







unset(
    $_POST['phone'],
    $_POST['telephone'],
    $_POST['tel'],
    $_POST['mobile']
);






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
    textLength($company) > 120
) {
    respond(
        false,
        'Please enter a valid company name.',
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


$companySafe = preg_replace(
    '/[\x00-\x1F\x7F]/u',
    '',
    $company
);


if ($nameSafe !== null) {
    $name = trim($nameSafe);
}


if ($companySafe !== null) {
    $company = trim($companySafe);
}


if ($subjectSafe !== null) {
    $subject = trim($subjectSafe);
}











function getSenderAddress(): string
{
    $host =
        $_SERVER['HTTP_HOST'] ?? '';

    



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


    



    if (
        stringStartsWith(
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


    



    if (
        $host !== '' &&
        preg_match(
            '/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i',
            $host
        )
    ) {
        return 'no-reply@' . $host;
    }


    



    return 'no-reply@localhost';
}


$senderEmail =
    getSenderAddress();






$mailSubject =
    mimeEncodeHeaderUtf8(
        'Website contact: ' .
        $subject
    );






$page =
    $_SERVER['HTTP_REFERER'] ?? 'Unknown';


$sentAt =
    gmdate(
        'Y-m-d H:i:s'
    ) . ' UTC';






$mailBody =
    "New message from the website\n" .
    "========================================\n\n" .

    "Name:\n" .
    $name . "\n\n" .

    "Email:\n" .
    $email . "\n\n" .

    "Company:\n" .
    ($company !== '' ? $company : 'Not provided') . "\n\n" .

    "Subject:\n" .
    $subject . "\n\n" .

    "Message:\n" .
    $message . "\n\n" .

    "----------------------------------------\n" .

    "Submitted:\n" .
    $sentAt . "\n\n" .

    "Page:\n" .
    $page . "\n";






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






$mailSent = @mail(
    $recipientEmail,
    $mailSubject,
    $mailBody,
    implode(
        "\r\n",
        $headers
    )
);






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
