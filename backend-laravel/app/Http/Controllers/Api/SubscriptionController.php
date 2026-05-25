<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * GET /api/subscriptions
     * Liste des abonnements de l'utilisateur connecté
     */
    public function index(Request $request): JsonResponse
    {
        $subscriptions = Subscription::with('product')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'product'    => [
                    'id'       => $s->product->id,
                    'name'     => $s->product->name,
                    'category' => $s->product->category,
                ],
                'plan'       => $s->plan,
                'status'     => $s->status,
                'price'      => $s->plan === 'annual'
                    ? $s->product->price_annual
                    : $s->product->price_monthly,
                'started_at' => $s->started_at,
                'ends_at'    => $s->ends_at,
                'created_at' => $s->created_at,
            ]);

        return response()->json($subscriptions);
    }

    /**
     * POST /api/subscriptions
     * Créer un abonnement (après commande)
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'plan'       => 'required|in:monthly,annual',
        ]);

        $subscription = Subscription::create([
            'user_id'    => $request->user()->id,
            'product_id' => $data['product_id'],
            'plan'       => $data['plan'],
            'status'     => 'active',
            'started_at' => now(),
            'ends_at'    => $data['plan'] === 'annual' ? now()->addYear() : now()->addMonth(),
        ]);

        return response()->json($subscription->load('product'), 201);
    }

    /**
     * PATCH /api/subscriptions/{subscription}/cancel
     */
    public function cancel(Subscription $subscription, Request $request): JsonResponse
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Abonnement annulé.']);
    }
}
