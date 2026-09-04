<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    */

    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
    'merchant_name' => env('MIDTRANS_MERCHANT_NAME', 'TokoOnline'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',

    'api_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com',

    'finish_redirect_url' => env('MIDTRANS_FINISH_REDIRECT_URL', 'http://localhost:3000/payment/success'),
    'unfinish_redirect_url' => env('MIDTRANS_UNFINISH_REDIRECT_URL', 'http://localhost:3000/payment/pending'),
    'error_redirect_url' => env('MIDTRANS_ERROR_REDIRECT_URL', 'http://localhost:3000/payment/pending'),

];
