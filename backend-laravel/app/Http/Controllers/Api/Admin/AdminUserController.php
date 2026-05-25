<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * GET /api/admin/users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::withCount(['orders', 'subscriptions']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('email', 'like', '%' . $request->search . '%')
                  ->orWhere('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('company', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->latest()->paginate(20);

        $users->getCollection()->transform(fn($u) => [
            'id'              => $u->id,
            'first_name'      => $u->first_name,
            'last_name'       => $u->last_name,
            'email'           => $u->email,
            'company'         => $u->company,
            'role'            => $u->role,
            'is_active'       => $u->is_active,
            'orders_count'    => $u->orders_count,
            'subscriptions_count' => $u->subscriptions_count,
            'created_at'      => $u->created_at,
        ]);

        return response()->json($users);
    }

    /**
     * GET /api/admin/users/{user}
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['orders', 'subscriptions.product']);
        return response()->json($user);
    }

    /**
     * PATCH /api/admin/users/{user}/toggle
     * Activer / désactiver un utilisateur
     */
    public function toggle(Request $request, User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de désactiver un admin.'], 403);
        }

        $user->update(['is_active' => ! $user->is_active]);

        ActivityLog::record(
            $request->user()->id,
            'user_toggled',
            "Utilisateur {$user->email} : " . ($user->is_active ? 'activé' : 'désactivé'),
            $request->ip()
        );

        return response()->json([
            'id'        => $user->id,
            'is_active' => $user->is_active,
        ]);
    }

    /**
     * DELETE /api/admin/users/{user}
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un admin.'], 403);
        }

        ActivityLog::record(
            $request->user()->id,
            'user_deleted',
            "Utilisateur supprimé : {$user->email}",
            $request->ip()
        );

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
