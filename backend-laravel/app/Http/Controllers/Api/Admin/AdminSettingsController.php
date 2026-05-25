<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminSettingsController extends Controller
{
    private const CACHE_KEY = 'cyna_admin_settings';

    private array $defaults = [
        'two_factor_required'     => true,
        'session_timeout'         => 30,
        'auto_backup'             => true,
        'backup_frequency'        => 'daily',
        'gdpr_enabled'            => true,
        'data_retention_days'     => 365,
        'email_notifications'     => true,
        'slack_notifications'     => false,
        'maintenance_mode'        => false,
        'registration_open'       => true,
        'max_login_attempts'      => 5,
    ];

    /**
     * GET /api/admin/settings
     */
    public function index(): JsonResponse
    {
        $settings = Cache::get(self::CACHE_KEY, $this->defaults);
        return response()->json($settings);
    }

    /**
     * PUT /api/admin/settings
     */
    public function update(Request $request): JsonResponse
    {
        $current = Cache::get(self::CACHE_KEY, $this->defaults);

        $merged = array_merge($current, $request->only(array_keys($this->defaults)));

        Cache::put(self::CACHE_KEY, $merged, now()->addYear());

        return response()->json([
            'message'  => 'Paramètres enregistrés.',
            'settings' => $merged,
        ]);
    }
}
