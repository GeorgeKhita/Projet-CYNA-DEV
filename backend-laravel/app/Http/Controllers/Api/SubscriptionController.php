<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function show(Request $request, int $id): JsonResponse
    {
        $subscription = Subscription::with('product.category')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'id'                   => $subscription->id,
            'status'               => $subscription->status,
            'billing_cycle'        => $subscription->billing_cycle,
            'current_period_start' => $subscription->current_period_start?->format('Y-m-d'),
            'current_period_end'   => $subscription->current_period_end?->format('Y-m-d'),
            'cancelled_at'         => $subscription->cancelled_at?->format('Y-m-d H:i:s'),
            'price'                => (float) ($subscription->billing_cycle === 'annual'
                ? $subscription->product?->price_annual
                : $subscription->product?->price_monthly),
            'product'              => $subscription->product ? [
                'id'             => $subscription->product->id,
                'name'           => $subscription->product->name,
                'category'       => $subscription->product->category?->name ?? '',
                'category_color' => $subscription->product->category?->color ?? '#00B4D8',
            ] : null,
            'order_id'             => $subscription->order_id,
            'created_at'           => $subscription->created_at,
        ]);
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

    public function renew(Request $request, int $id): JsonResponse
    {
        $subscription = Subscription::where('user_id', $request->user()->id)
            ->with('product')
            ->findOrFail($id);

        if (!in_array($subscription->status, ['cancelled', 'expired', 'past_due'])) {
            return response()->json(['message' => 'Seuls les abonnements annulés, expirés ou en retard peuvent être renouvelés.'], 422);
        }

        $end = $subscription->billing_cycle === 'annual'
            ? now()->addYear()
            : now()->addMonth();

        $subscription->update([
            'status'               => 'active',
            'current_period_start' => now()->toDateString(),
            'current_period_end'   => $end->toDateString(),
            'cancelled_at'         => null,
        ]);

        return response()->json([
            'message'            => 'Abonnement renouvelé avec succès.',
            'current_period_end' => $end->toDateString(),
        ]);
    }
}
