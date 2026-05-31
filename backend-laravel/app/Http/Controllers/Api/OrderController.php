<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * POST /api/orders
     * Crée une commande depuis le tunnel de paiement
     * Body: { items: [{ product_id, plan, price }], total, billing_address? }
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.plan'       => 'required|in:monthly,annual',
            'items.*.price'      => 'required|numeric|min:0',
            'total'              => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'      => $request->user()->id,
                'status'       => 'active',
                'total_amount' => $data['total'],
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => 1,
                    'price'      => $item['price'],
                    'plan'       => $item['plan'],
                ]);

                Subscription::create([
                    'user_id'           => $request->user()->id,
                    'product_id'        => $product->id,
                    'order_id'          => $order->id,
                    'status'            => 'active',
                    'price'             => $item['price'],
                    'plan'              => $item['plan'],
                    'next_billing_date' => $item['plan'] === 'annual'
                        ? now()->addYear()
                        : now()->addMonth(),
                ]);
            }

            // Générer la facture avec un numéro unique
            $invoiceNumber = 'CYN-' . now()->format('Ym') . '-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);
            Invoice::create([
                'user_id'        => $request->user()->id,
                'order_id'       => $order->id,
                'invoice_number' => $invoiceNumber,
                'amount'         => $data['total'],
                'status'         => 'paid',
            ]);

            ActivityLog::record(
                $request->user()->id,
                'order_created',
                "Commande #{$order->id} — {$data['total']}€",
                $request->ip()
            );

            DB::commit();

            return response()->json($this->formatOrder($order->load(['items.product', 'invoices'])), 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création de la commande.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/orders
     * Commandes de l'utilisateur connecté
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product', 'invoices'])
            ->latest()
            ->get()
            ->map(fn($o) => $this->formatOrder($o));

        return response()->json($orders);
    }

    /**
     * GET /api/orders/:id
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['items.product', 'invoices'])
            ->findOrFail($id);

        return response()->json($this->formatOrder($order));
    }

    // ── Private ────────────────────────────────────────────────────────────

    private function formatOrder(Order $order): array
    {
        return [
            'id'         => $order->id,
            'ref'        => 'CYN-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            'status'     => $order->status,
            'total'      => (float) $order->total_amount,
            'created_at' => $order->created_at,
            'items'      => $order->items->map(fn($i) => [
                'product_id'   => $i->product_id,
                'product_name' => $i->product?->name ?? '—',
                'plan'         => $i->plan ?? 'monthly',
                'price'        => (float) $i->price,
                'quantity'     => $i->quantity,
            ])->toArray(),
            'invoice_id'     => $order->invoices->first()?->id,
            'invoice_number' => $order->invoices->first()?->invoice_number,
        ];
    }
}
