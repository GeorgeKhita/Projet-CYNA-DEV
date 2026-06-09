<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::withCount(['orders', 'subscriptions']);

        if ($request->filled('search')) {
            $query->where(fn($q) => $q
                ->where('email',      'like', '%' . $request->search . '%')
                ->orWhere('first_name','like', '%' . $request->search . '%')
                ->orWhere('last_name', 'like', '%' . $request->search . '%')
                ->orWhere('company',   'like', '%' . $request->search . '%')
            );
        }
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(20);

        $users->getCollection()->transform(fn($u) => [
            'id'                  => $u->id,
            'first_name'          => $u->first_name,
            'last_name'           => $u->last_name,
            'email'               => $u->email,
            'company'             => $u->company,
            'role'                => $u->role,
            'orders_count'        => $u->orders_count,
            'subscriptions_count' => $u->subscriptions_count,
            'created_at'          => $u->created_at,
        ]);

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['orders', 'subscriptions.product']);
        return response()->json($user);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un admin.'], 403);
        }
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Impossible de se supprimer soi-même.'], 403);
        }

        ActivityLog::record($request->user()->id, 'user_deleted', "Utilisateur supprimé : {$user->email} (id:{$user->id})", $request->ip());

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
