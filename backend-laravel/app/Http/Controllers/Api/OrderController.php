<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subtotal'           => 'required|numeric|min:0',
            'tax'                => 'nullable|numeric|min:0',
            'total'              => 'required|numeric|min:0',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price'=> 'required|numeric|min:0',
            'items.*.duration'   => 'required|in:monthly,annual',
        ]);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'  => $request->user()->id,
                'status'   => 'paid',
                'subtotal' => $data['subtotal'],
                'tax'      => $data['tax'] ?? 0,
                'total'    => $data['total'],
            ]);

            foreach ($data['items'] as $item) {
                OrderDetail::create([
                    'order_id'    => $order->id,
                    'product_id'  => $item['product_id'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['total_price'],
                    'duration'    => $item['duration'],
                ]);

                Subscription::create([
                    'user_id'              => $request->user()->id,
                    'product_id'           => $item['product_id'],
                    'order_id'             => $order->id,
                    'status'               => 'active',
                    'billing_cycle'        => $item['duration'],
                    'current_period_start' => now()->toDateString(),
                    'current_period_end'   => $item['duration'] === 'annual'
                        ? now()->addYear()->toDateString()
                        : now()->addMonth()->toDateString(),
                ]);
            }

            DB::commit();

            return response()->json([
                'id'         => $order->id,
                'ref'        => 'CYN-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                'status'     => $order->status,
                'total'      => (float) $order->total,
                'created_at' => $order->created_at,
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création de la commande : ' . $e->getMessage()], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['details.product'])
            ->latest()
            ->get()
            ->map(fn($o) => [
                'id'         => $o->id,
                'ref'        => 'CYN-' . str_pad($o->id, 6, '0', STR_PAD_LEFT),
                'status'     => $o->status,
                'total'      => (float) $o->total,
                'created_at' => $o->created_at,
                'items'      => $o->details->map(fn($d) => [
                    'product_id'   => $d->product_id,
                    'product'      => ['name' => $d->product?->name],
                    'quantity'     => $d->quantity,
                    'unit_price'   => (float) $d->unit_price,
                    'duration'     => $d->duration,
                ]),
            ]);

        return response()->json($orders);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['details.product'])
            ->findOrFail($id);

        return response()->json([
            'id'         => $order->id,
            'ref'        => 'CYN-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            'status'     => $order->status,
            'total'      => (float) $order->total,
            'created_at' => $order->created_at,
            'items'      => $order->details->map(fn($d) => [
                'product_id'   => $d->product_id,
                'product'      => ['name' => $d->product?->name],
                'quantity'     => $d->quantity,
                'unit_price'   => (float) $d->unit_price,
                'duration'     => $d->duration,
            ]),
        ]);
    }
}
