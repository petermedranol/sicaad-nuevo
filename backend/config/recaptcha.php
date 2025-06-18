<?php

return [
    /*
    |--------------------------------------------------------------------------
    | reCAPTCHA Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your reCAPTCHA settings. You can get your
    | site key and secret key from the Google reCAPTCHA Admin Console.
    |
    */

    'site_key' => env('RECAPTCHA_SITE_KEY'),
    'secret_key' => env('RECAPTCHA_SECRET_KEY'),
    'verify_url' => 'https://www.google.com/recaptcha/api/siteverify',
];

