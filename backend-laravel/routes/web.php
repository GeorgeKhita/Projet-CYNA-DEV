<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name'    => 'CYNA API',
        'version' => '1.0.0',
        'status'  => 'online',
    ]);
});

// Route "login" nommée : cible de redirection par défaut quand une requête
// non authentifiée n'est pas détectée comme JSON (ex. téléchargement PDF avec
// token expiré). Sans elle, route('login') lève une exception → 500.
// Ici on renvoie simplement un 401 JSON propre.
Route::get('/login', function () {
    return response()->json(['message' => 'Non authentifié.'], 401);
})->name('login');
