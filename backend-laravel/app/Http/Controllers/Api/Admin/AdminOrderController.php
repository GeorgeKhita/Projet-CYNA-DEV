<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * GET /api/admin/orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('email', 'like', '%' . $request->search . '%')
                  ->orWhere('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%');
            });
        }

        $orders = $query->latest()->paginate(20);

        $orders->getCollection()->transform(fn($o) => [
            'id'         => $o->id,
            'ref'        => 'CMD-' . str_pad($o->id, 4, '0', STR_PAD_LEFT),
            'client'     => $o->user
                ? $o->user->first_name . ' ' . $o->user->last_name
                : 'N/A',
            'email'      => $o->user?->email,
            'items'      => $o->items->map(fn($i) => [
                'product_name' => $i->product->name ?? 'N/A',
                'plan'         => $i->plan,
                'price'        => $i->price,
            ]),
            'total'      => $o->total,
            'status'     => $o->status,
            'created_at' => $o->created_at,
        ]);

        return response()->json($orders);
    }

    /**
     * GET /api/admin/orders/{order}
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['user', 'items.product']);
        return response()->json($order);
    }

    /**
     * PATCH /api/admin/orders/{order}/status
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,paid,cancelled,refunded',
        ]);

        $oldStatus = $order->status;
        $order->update(['status' => $data['status']]);

        ActivityLog::record(
            $request->user()->id,
            'order_status_changed',
            "Commande CMD-" . str_pad($order->id, 4, '0', STR_PAD_LEFT) . " : $oldStatus → {$data['status']}",
            $request->ip()
        );

        return response()->json($order);
    }
}
