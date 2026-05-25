<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * GET /api/admin/logs
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::latest();

        if ($request->filled('type')) {
            $query->where('action', $request->type);
        }
        if ($request->filled('search')) {
            $query->where('detail', 'like', '%' . $request->search . '%');
        }

        $logs = $query->paginate(50);

        return response()->json($logs);
    }

    /**
     * DELETE /api/admin/logs
     * Effacer tous les logs
     */
    public function clear(Request $request): JsonResponse
    {
        ActivityLog::query()->delete();

        ActivityLog::record(
            $request->user()->id,
            'logs_cleared',
            'Tous les logs ont été effacés',
            $request->ip()
        );

        return response()->json(['message' => 'Logs effacés.']);
    }
}
