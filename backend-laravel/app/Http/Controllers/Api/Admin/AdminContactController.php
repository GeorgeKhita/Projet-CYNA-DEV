<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactController extends Controller
{
    /**
     * GET /api/admin/contact-messages
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('email', 'like', "%{$s}%")
                ->orWhere('name', 'like', "%{$s}%")
                ->orWhere('subject', 'like', "%{$s}%")
            );
        }

        if ($request->filled('status')) {
            $query->where('is_read', $request->status === 'read');
        }

        $messages = $query->paginate(20);

        return response()->json([
            'data'         => $messages->items(),
            'current_page' => $messages->currentPage(),
            'last_page'    => $messages->lastPage(),
            'total'        => $messages->total(),
            'unread_count' => ContactMessage::where('is_read', false)->count(),
        ]);
    }

    /**
     * GET /api/admin/contact-messages/{id}
     */
    public function show(ContactMessage $contactMessage): JsonResponse
    {
        if (! $contactMessage->is_read) {
            $contactMessage->update(['is_read' => true, 'read_at' => now()]);
        }
        return response()->json($contactMessage);
    }

    /**
     * PATCH /api/admin/contact-messages/{id}/read
     */
    public function markRead(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->update(['is_read' => true, 'read_at' => now()]);
        return response()->json(['message' => 'Message marqué comme lu.']);
    }

    /**
     * DELETE /api/admin/contact-messages/{id}
     */
    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();
        return response()->json(['message' => 'Message supprimé.']);
    }
}
