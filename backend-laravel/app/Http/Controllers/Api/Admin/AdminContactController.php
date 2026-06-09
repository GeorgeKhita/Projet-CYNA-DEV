<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SupportMessage::with('user')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('email',   'like', "%{$s}%")
                ->orWhere('subject','like', "%{$s}%")
            );
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $messages = $query->paginate(20);

        return response()->json([
            'data'         => $messages->items(),
            'current_page' => $messages->currentPage(),
            'last_page'    => $messages->lastPage(),
            'total'        => $messages->total(),
            'new_count'    => SupportMessage::where('status', 'new')->count(),
        ]);
    }

    public function show(SupportMessage $supportMessage): JsonResponse
    {
        if ($supportMessage->status === 'new') {
            $supportMessage->update(['status' => 'in_progress']);
        }
        return response()->json($supportMessage);
    }

    public function markResolved(SupportMessage $supportMessage): JsonResponse
    {
        $supportMessage->update(['status' => 'resolved']);
        return response()->json(['message' => 'Message marqué comme résolu.']);
    }

    public function destroy(SupportMessage $supportMessage): JsonResponse
    {
        $supportMessage->delete();
        return response()->json(['message' => 'Message supprimé.']);
    }
}
