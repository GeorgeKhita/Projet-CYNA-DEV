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
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\Admin\AdminTicketController;
use App\Http\Controllers\Api\Admin\AdminContactController;

/*
|--------------------------------------------------------------------------
| API Routes — CYNA Backend
|--------------------------------------------------------------------------
*/

// ── Routes publiques ─────────────────────────────────────────────────────

Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register'])->middleware('throttle:auth-general');
    Route::post('/login',           [AuthController::class, 'login'])->middleware('throttle:auth-general');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth-general');
    Route::post('/reset-password',  [AuthController::class, 'resetPassword'])->middleware('throttle:auth-general');
    Route::get('/verify-email',          [AuthController::class, 'verifyEmail']);
    Route::get('/confirm-email-change',  [AuthController::class, 'confirmEmailChange']);
});

// Produits + catégories publics
Route::get('/products',          [ProductController::class, 'index']);
Route::get('/products/search',   [ProductController::class, 'search']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories',        [CategoryController::class, 'index']);

// Carousel homepage (public)
Route::get('/carousel', function () {
    return response()->json(
        \App\Models\CarouselSlide::where('active', true)->orderBy('display_order')->get()
    );
});

// Recherche entreprises (proxy Sirene / data.gouv.fr)
Route::get('/companies/search', [CompanyController::class, 'search']);

// Formulaire de contact
Route::post('/contact', [ContactController::class, 'send']);

// Codes promo (public — validation avant checkout)
Route::post('/promo-codes/validate', [PromoCodeController::class, 'validate']);

// Chatbot IA (public — fonctionne connecté ou anonyme)
Route::post('/chatbot/message', [ChatbotController::class, 'message']);

// 2FA — Vérification au login (public car pas encore de token Sanctum)
Route::post('/auth/admin/verify-2fa', [AuthController::class, 'verifyAdmin2FA'])->middleware('throttle:auth-general');

// Webhook Stripe (public, signature vérifiée dans le controller)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// ── Routes authentifiées (Sanctum) ───────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout',        [AuthController::class, 'logout']);
    Route::get('/auth/me',             [AuthController::class, 'me']);
    Route::put('/auth/me',             [AuthController::class, 'updateProfile']);
    Route::delete('/auth/me',          [AuthController::class, 'deleteAccount']);
    Route::get('/auth/me/export',      [AuthController::class, 'exportMyData']);

    // 2FA — Configuration (admin seulement)
    Route::post('/auth/admin/setup-2fa',   [AuthController::class, 'sendAdmin2FA']);
    Route::post('/auth/admin/confirm-2fa', [AuthController::class, 'confirmAdmin2FA']);
    Route::delete('/auth/admin/disable-2fa', [AuthController::class, 'disableAdmin2FA']);

    // Adresses
    Route::get('/user/addresses',                    [AddressController::class, 'index']);
    Route::post('/user/addresses',                   [AddressController::class, 'store']);
    Route::put('/user/addresses/{id}',               [AddressController::class, 'update']);
    Route::delete('/user/addresses/{id}',            [AddressController::class, 'destroy']);
    Route::patch('/user/addresses/{id}/default',     [AddressController::class, 'setDefault']);

    // Méthodes de paiement
    Route::get('/user/payment-methods',         [PaymentMethodController::class, 'index']);
    Route::post('/user/payment-methods',        [PaymentMethodController::class, 'store']);
    Route::put('/user/payment-methods/{id}',    [PaymentMethodController::class, 'update']);
    Route::delete('/user/payment-methods/{id}', [PaymentMethodController::class, 'destroy']);

    // Paiement Stripe
    Route::post('/payments/intent', [PaymentController::class, 'createIntent']);

    // Commandes client
    Route::get('/orders',                      [OrderController::class, 'index']);
    Route::post('/orders',                     [OrderController::class, 'store']);
    Route::get('/orders/{id}',                 [OrderController::class, 'show']);
    Route::post('/orders/{id}/confirm',        [OrderController::class, 'confirm']);

    // Abonnements
    Route::get('/subscriptions',                              [SubscriptionController::class, 'index']);
    Route::get('/subscriptions/{id}',                        [SubscriptionController::class, 'show']);
    Route::patch('/subscriptions/{subscription}/cancel',      [SubscriptionController::class, 'cancel']);
    Route::patch('/subscriptions/{id}/renew',                 [SubscriptionController::class, 'renew']);

    // Factures
    Route::get('/invoices',           [InvoiceController::class, 'index']);
    Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download']);

    // Licences
    Route::get('/licenses', function (\Illuminate\Http\Request $request) {
        return response()->json(
            \App\Models\License::where('user_id', $request->user()->id)
                ->with('product:id,name')
                ->latest()
                ->get()
                ->map(fn($l) => [
                    'id'          => $l->id,
                    'license_key' => $l->license_key,
                    'product'     => $l->product?->name,
                    'order_id'    => $l->order_id,
                    'activated_at'=> $l->activated_at,
                    'created_at'  => $l->created_at,
                ])
        );
    });

    // Tickets support
    Route::get('/tickets',                        [TicketController::class, 'index']);
    Route::post('/tickets',                       [TicketController::class, 'store']);
    Route::get('/tickets/{id}',                   [TicketController::class, 'show']);
    Route::post('/tickets/{id}/messages',         [TicketController::class, 'addMessage']);

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

        // Tickets support (admin)
        Route::get('/tickets',                    [AdminTicketController::class, 'index']);
        Route::get('/tickets/{id}',               [AdminTicketController::class, 'show']);
        Route::patch('/tickets/{id}/status',      [AdminTicketController::class, 'updateStatus']);
        Route::post('/tickets/{id}/reply',        [AdminTicketController::class, 'reply']);

        // Messages support
        Route::get('/contact-messages',                            [AdminContactController::class, 'index']);
        Route::get('/contact-messages/{supportMessage}',           [AdminContactController::class, 'show']);
        Route::patch('/contact-messages/{supportMessage}/resolve', [AdminContactController::class, 'markResolved']);
        Route::delete('/contact-messages/{supportMessage}',        [AdminContactController::class, 'destroy']);

        // Codes promo (CRUD admin)
        Route::get('/promo-codes',                [PromoCodeController::class, 'index']);
        Route::post('/promo-codes',               [PromoCodeController::class, 'store']);
        Route::put('/promo-codes/{promoCode}',    [PromoCodeController::class, 'update']);
        Route::delete('/promo-codes/{promoCode}', [PromoCodeController::class, 'destroy']);
    });
});
