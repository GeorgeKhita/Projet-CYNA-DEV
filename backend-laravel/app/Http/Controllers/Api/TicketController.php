<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tickets = $request->user()->tickets()
            ->withCount('messages')
            ->latest()
            ->get()
            ->map(fn($t) => $this->format($t));

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject'  => 'required|string|max:200',
            'message'  => 'required|string',
            'priority' => 'in:low,normal,high,urgent',
        ]);

        $ticket = $request->user()->tickets()->create([
            'subject'  => $data['subject'],
            'priority' => $data['priority'] ?? 'normal',
            'status'   => 'open',
        ]);

        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $data['message'],
        ]);

        return response()->json($this->format($ticket->load('messages.user')), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $ticket = $request->user()->tickets()
            ->with('messages.user')
            ->findOrFail($id);

        return response()->json($this->format($ticket));
    }

    public function addMessage(Request $request, int $id): JsonResponse
    {
        $ticket = $request->user()->tickets()->findOrFail($id);

        if (in_array($ticket->status, ['resolved', 'closed'])) {
            return response()->json(['message' => 'Ce ticket est fermé.'], 422);
        }

        $data = $request->validate(['message' => 'required|string']);

        $msg = $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $data['message'],
        ]);

        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'open']);
        }

        return response()->json($msg, 201);
    }

    private function format(Ticket $t): array
    {
        return [
            'id'             => $t->id,
            'subject'        => $t->subject,
            'status'         => $t->status,
            'priority'       => $t->priority,
            'messages_count' => $t->messages_count ?? $t->messages?->count(),
            'created_at'     => $t->created_at,
            'messages'       => $t->relationLoaded('messages')
                ? $t->messages->map(fn($m) => [
                    'id'         => $m->id,
                    'message'    => $m->message,
                    'from'       => $m->user?->role === 'admin' ? 'admin' : 'user',
                    'created_at' => $m->created_at,
                ])
                : null,
        ];
    }
}
