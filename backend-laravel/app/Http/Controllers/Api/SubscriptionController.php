<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $subscriptions = Subscription::with('product.category')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($s) => [
                'id'                   => $s->id,
                'status'               => $s->status,
                'billing_cycle'        => $s->billing_cycle,
                'current_period_start' => $s->current_period_start?->format('Y-m-d'),
                'current_period_end'   => $s->current_period_end?->format('Y-m-d'),
                'cancelled_at'         => $s->cancelled_at?->format('Y-m-d H:i:s'),
                'price'                => (float) ($s->billing_cycle === 'annual'
                    ? $s->product?->price_annual
                    : $s->product?->price_monthly),
                'product'              => $s->product ? [
                    'id'             => $s->product->id,
                    'name'           => $s->product->name,
                    'category'       => $s->product->category?->name ?? '',
                    'category_color' => $s->product->category?->color ?? '#00B4D8',
                ] : null,
                'created_at'           => $s->created_at,
            ]);

        return response()->json($subscriptions);
    }

    public function cancel(Subscription $subscription, Request $request): JsonResponse
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $subscription->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return response()->json(['message' => 'Abonnement annulé.']);
    }
}
