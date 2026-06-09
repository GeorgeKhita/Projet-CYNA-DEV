<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'details.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->whereHas('user', fn($q) => $q
                ->where('email',      'like', '%' . $request->search . '%')
                ->orWhere('first_name','like', '%' . $request->search . '%')
                ->orWhere('last_name', 'like', '%' . $request->search . '%')
            );
        }

        $orders = $query->latest()->paginate(20);

        $orders->getCollection()->transform(fn($o) => [
            'id'         => $o->id,
            'ref'        => 'CYN-' . str_pad($o->id, 6, '0', STR_PAD_LEFT),
            'client'     => $o->user ? $o->user->first_name . ' ' . $o->user->last_name : 'N/A',
            'email'      => $o->user?->email,
            'items'      => $o->details->map(fn($d) => [
                'product_name' => $d->product?->name ?? 'N/A',
                'duration'     => $d->duration,
                'unit_price'   => (float) $d->unit_price,
                'quantity'     => $d->quantity,
            ]),
            'total'      => (float) $o->total,
            'status'     => $o->status,
            'created_at' => $o->created_at,
        ]);

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['user', 'details.product']);
        return response()->json($order);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $order->update(['status' => $data['status']]);

        return response()->json(['message' => 'Statut mis à jour.', 'status' => $order->status]);
    }
}
