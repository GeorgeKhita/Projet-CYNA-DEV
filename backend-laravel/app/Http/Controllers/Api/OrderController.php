<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderConfirmationMail;
use App\Models\Invoice;
use App\Models\License;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'payment_intent_id'  => 'required|string|starts_with:pi_',
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

        $stripe = new StripeClient(config('services.stripe.secret'));
        $intent = $stripe->paymentIntents->retrieve($data['payment_intent_id']);

        if ($intent->status !== 'succeeded') {
            return response()->json(['message' => 'Paiement non confirmé par Stripe.'], 422);
        }

        // Vérifier la capacité maximale pour chaque produit
        foreach ($data['items'] as $item) {
            $product = Product::find($item['product_id']);
            if ($product && $product->max_capacity !== null) {
                $activeCount = Subscription::where('product_id', $item['product_id'])
                    ->whereIn('status', ['active', 'past_due'])
                    ->count();
                if ($activeCount + $item['quantity'] > $product->max_capacity) {
                    $remaining = max(0, $product->max_capacity - $activeCount);
                    return response()->json([
                        'message' => "Stock insuffisant pour « {$product->name} ». Produits restants : {$remaining}.",
                    ], 422);
                }
            }
        }

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'      => $request->user()->id,
                'status'       => 'paid',
                'subtotal'     => $data['subtotal'],
                'tax'          => $data['tax'] ?? 0,
                'total'        => $data['total'],
                'stripe_pi_id' => $data['payment_intent_id'],
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

            $invoiceNumber = 'CYN-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
            $invoice = Invoice::create([
                'user_id'        => $request->user()->id,
                'order_id'       => $order->id,
                'invoice_number' => $invoiceNumber,
                'amount'         => $data['total'],
                'status'         => 'paid',
            ]);

            // Générer une licence par produit commandé
            $licenses = [];
            foreach ($data['items'] as $item) {
                $key = 'CYNA-' . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 3))
                     . '-' . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 4))
                     . '-' . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 4));

                $license = License::create([
                    'user_id'     => $request->user()->id,
                    'order_id'    => $order->id,
                    'product_id'  => $item['product_id'],
                    'license_key' => $key,
                ]);
                $licenses[] = array_merge($license->toArray(), [
                    'product_name' => \App\Models\Product::find($item['product_id'])?->name,
                ]);
            }

            DB::commit();

            // ── Email de confirmation (hors transaction) ──────────────────────────────
            $user = $request->user();

            $mailItems = collect($data['items'])->map(function ($item) {
                return [
                    'product_name' => \App\Models\Product::find($item['product_id'])?->name,
                    'duration'     => $item['duration'],
                    'total_price'  => $item['total_price'],
                ];
            })->toArray();

            OrderConfirmationMail::send(
                $user,
                $invoice,
                $mailItems,
                $licenses,
                $invoiceNumber,
                (float) $data['subtotal'],
                (float) ($data['tax'] ?? 0),
                (float) $data['total']
            );

            // Alerte admin si commande > 5 000 €
            if ($data['total'] > 5000) {
                $adminHtml = "<p>Une commande supérieure à 5 000 € vient d'être passée.</p>
                              <p><strong>Client :</strong> {$user->first_name} {$user->last_name} ({$user->email})</p>
                              <p><strong>Montant :</strong> " . number_format($data['total'], 2, ',', ' ') . " €</p>
                              <p><strong>Référence :</strong> {$invoiceNumber}</p>";
                \App\Services\MailService::send(
                    config('mail.admin_address', 'admin@cyna-it.fr'),
                    "⚠️ Commande importante #{$invoiceNumber} — " . number_format($data['total'], 2, ',', ' ') . ' €',
                    $adminHtml,
                    'Admin CYNA'
                );
            }

            return response()->json([
                'id'         => $order->id,
                'ref'        => $invoiceNumber,
                'status'     => $order->status,
                'subtotal'   => (float) $order->subtotal,
                'tax'        => (float) $order->tax,
                'total'      => (float) $order->total,
                'invoice_id' => $invoice->id,
                'licenses'   => $licenses,
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
            ->with(['details.product', 'invoice'])
            ->latest()
            ->get()
            ->map(fn($o) => [
                'id'         => $o->id,
                'ref'        => 'CYN-' . str_pad($o->id, 6, '0', STR_PAD_LEFT),
                'status'     => $o->status,
                'total'      => (float) $o->total,
                'invoice_id' => $o->invoice?->id,
                'created_at' => $o->created_at,
                'items'      => $o->details->map(fn($d) => [
                    'product_id' => $d->product_id,
                    'product'    => ['name' => $d->product?->name],
                    'quantity'   => $d->quantity,
                    'unit_price' => (float) $d->unit_price,
                    'duration'   => $d->duration,
                ]),
            ]);

        return response()->json($orders);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['details.product', 'invoice'])
            ->findOrFail($id);

        return response()->json([
            'id'         => $order->id,
            'ref'        => 'CYN-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            'status'     => $order->status,
            'total'      => (float) $order->total,
            'invoice_id' => $order->invoice?->id,
            'created_at' => $order->created_at,
            'items'      => $order->details->map(fn($d) => [
                'product_id' => $d->product_id,
                'product'    => ['name' => $d->product?->name],
                'quantity'   => $d->quantity,
                'unit_price' => (float) $d->unit_price,
                'duration'   => $d->duration,
            ]),
        ]);
    }
}
