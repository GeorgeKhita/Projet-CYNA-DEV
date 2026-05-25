<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name'    => 'CYNA API',
        'version' => '1.0.0',
        'status'  => 'online',
    ]);
});
