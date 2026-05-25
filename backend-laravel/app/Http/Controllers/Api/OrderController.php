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
     * Crée une commande depuis le panier du front
     * Body: { items: [{ product_id, quantity, subscription_type }] }
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items'                        => 'required|array|min:1',
            'items.*.product_id'           => 'required|integer|exists:products,id',
            'items.*.quantity'             => 'required|integer|min:1',
            'items.*.subscription_type'    => 'required|in:monthly,annual',
        ]);

        DB::beginTransaction();
        try {
            $total = 0;
            $orderItems = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $price   = $item['subscription_type'] === 'annual'
                    ? $product->price_annual
                    : $product->price_monthly;
                $lineTotal = $price * $item['quantity'];
                $total += $lineTotal;

                $orderItems[] = [
                    'product_id'        => $product->id,
                    'quantity'          => $item['quantity'],
                    'price'             => $price,
                    'subscription_type' => $item['subscription_type'],
                ];
            }

            $order = Order::create([
                'user_id'      => $request->user()->id,
                'status'       => 'pending',
                'total_amount' => $total,
            ]);

            foreach ($orderItems as $oi) {
                $oi['order_id'] = $order->id;
                OrderItem::create($oi);

                // Créer l'abonnement associé
                Subscription::create([
                    'user_id'           => $request->user()->id,
                    'product_id'        => $oi['product_id'],
                    'order_id'          => $order->id,
                    'status'            => 'active',
                    'price'             => $oi['price'],
                    'plan'              => $oi['subscription_type'],
                    'next_billing_date' => now()->addMonth(),
                ]);
            }

            // Générer une facture
            Invoice::create([
                'user_id'  => $request->user()->id,
                'order_id' => $order->id,
                'amount'   => $total,
            ]);

            // Passer la commande à "active"
            $order->update(['status' => 'active']);

            ActivityLog::record(
                $request->user()->id,
                'order_created',
                "Commande #{$order->id} — {$total}€",
                $request->ip()
            );

            DB::commit();

            return response()->json($order->load('items.product'), 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création de la commande.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Liste les commandes de l'utilisateur connecté
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->latest()
            ->get();

        return response()->json($orders);
    }

    /**
     * Détail d'une commande
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->findOrFail($id);

        return response()->json($order);
    }
}
