<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tickets = Ticket::with('user')
            ->withCount('messages')
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('priority'), fn($q) => $q->where('priority', $request->priority))
            ->latest()
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'subject'        => $t->subject,
                'status'         => $t->status,
                'priority'       => $t->priority,
                'messages_count' => $t->messages_count,
                'user'           => ['id' => $t->user->id, 'name' => $t->user->full_name, 'email' => $t->user->email],
                'created_at'     => $t->created_at,
            ]);

        return response()->json($tickets);
    }

    public function show(int $id): JsonResponse
    {
        $ticket = Ticket::with(['user', 'messages.user'])->findOrFail($id);

        return response()->json([
            'id'       => $ticket->id,
            'subject'  => $ticket->subject,
            'status'   => $ticket->status,
            'priority' => $ticket->priority,
            'user'     => ['id' => $ticket->user->id, 'name' => $ticket->user->full_name, 'email' => $ticket->user->email],
            'messages' => $ticket->messages->map(fn($m) => [
                'id'         => $m->id,
                'message'    => $m->message,
                'from'       => $m->user?->role === 'admin' ? 'admin' : 'user',
                'user_name'  => $m->user?->full_name,
                'created_at' => $m->created_at,
            ]),
            'created_at' => $ticket->created_at,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $data = $request->validate([
            'status'   => 'required|in:open,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,normal,high,urgent',
        ]);

        $ticket->update($data);

        return response()->json(['message' => 'Ticket mis à jour.', 'ticket' => $ticket]);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $data = $request->validate(['message' => 'required|string']);

        $msg = $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $data['message'],
        ]);

        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        return response()->json($msg, 201);
    }
}
