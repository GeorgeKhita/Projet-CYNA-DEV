<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminCarouselController;
use App\Http\Controllers\Api\Admin\ActivityLogController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;

/*
|--------------------------------------------------------------------------
| API Routes — CYNA Backend
|--------------------------------------------------------------------------
*/

// ── Routes publiques ─────────────────────────────────────────────────────

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
});

// Produits + catégories publics
Route::get('/products',          [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories',        [CategoryController::class, 'index']);

// ── Routes authentifiées (Sanctum) ───────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);
    Route::put('/auth/me',      [AuthController::class, 'updateProfile']);

    // Commandes client
    Route::get('/orders',        [OrderController::class, 'index']);
    Route::post('/orders',       [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Abonnements
    Route::get('/subscriptions',           [SubscriptionController::class, 'index']);
    Route::post('/subscriptions',          [SubscriptionController::class, 'store']);
    Route::patch('/subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel']);

    // Factures
    Route::get('/invoices',           [InvoiceController::class, 'index']);
    Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download']);

    // ── Panel Admin ───────────────────────────────────────────────────────
    Route::prefix('admin')->middleware('admin')->group(function () {

        // Dashboard stats
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/dashboard/revenue-chart', [DashboardController::class, 'revenueChart']);

        // Produits admin (CRUD complet)
        Route::get('/products',              [AdminProductController::class, 'index']);
        Route::post('/products',             [AdminProductController::class, 'store']);
        Route::get('/products/{product}',    [AdminProductController::class, 'show']);
        Route::put('/products/{product}',    [AdminProductController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
        Route::patch('/products/{product}/toggle', [AdminProductController::class, 'toggle']);

        // Catégories admin (CRUD)
        Route::get('/categories',              [AdminCategoryController::class, 'index']);
        Route::post('/categories',             [AdminCategoryController::class, 'store']);
        Route::put('/categories/{category}',   [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        // Commandes admin
        Route::get('/orders',              [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}',      [AdminOrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

        // Utilisateurs admin
        Route::get('/users',               [AdminUserController::class, 'index']);
        Route::get('/users/{user}',        [AdminUserController::class, 'show']);
        Route::patch('/users/{user}/toggle', [AdminUserController::class, 'toggle']);
        Route::delete('/users/{user}',     [AdminUserController::class, 'destroy']);

        // Carrousel
        Route::get('/carousel',            [AdminCarouselController::class, 'index']);
        Route::post('/carousel',           [AdminCarouselController::class, 'store']);
        Route::put('/carousel/{slide}',    [AdminCarouselController::class, 'update']);
        Route::delete('/carousel/{slide}', [AdminCarouselController::class, 'destroy']);
        Route::post('/carousel/reorder',   [AdminCarouselController::class, 'reorder']);

        // Logs
        Route::get('/logs',    [ActivityLogController::class, 'index']);
        Route::delete('/logs', [ActivityLogController::class, 'clear']);

        // Paramètres
        Route::get('/settings',  [AdminSettingsController::class, 'index']);
        Route::put('/settings',  [AdminSettingsController::class, 'update']);
    });
});
