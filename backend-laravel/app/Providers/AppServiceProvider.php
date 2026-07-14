<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);
        JsonResource::withoutWrapping();

        RateLimiter::for('auth-general', fn (Request $request) =>
            Limit::perMinute(5)
                ->by($request->ip() . '|' . $request->input('email'))
                ->response(fn (Request $request, array $headers) => response()->json([
                    'message' => 'Trop de tentatives. Veuillez réessayer dans ' . ($headers['Retry-After'] ?? 60) . ' secondes.',
                ], 429, $headers))
        );
    }
}
