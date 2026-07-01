<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\License;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Subscription;
use App\Services\MailService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class OrderController extends Controller
{
    /**
     * POST /api/orders
     * Crée une commande pending + un PaymentIntent Stripe.
     * Les prix sont figés côté serveur depuis la base de données.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.duration'   => 'required|in:monthly,annual',
            'address_id'         => 'nullable|integer|exists:addresses,id',
        ]);

        // Prix figés : lecture depuis la DB, jamais depuis le client
        $productIds = collect($data['items'])->pluck('product_id');
        $products   = Product::whereIn('id', $productIds)->get()->keyBy('id');

        // Vérification de stock
        foreach ($data['items'] as $item) {
            $product = $products[$item['product_id']];
            if ($product->max_capacity !== null) {
                $activeCount = Subscription::where('product_id', $product->id)
                    ->whereIn('status', ['active', 'past_due'])
                    ->count();
                if ($activeCount + $item['quantity'] > $product->max_capacity) {
                    $remaining = max(0, $product->max_capacity - $activeCount);
                    return response()->json([
                        'message' => "Stock insuffisant pour « {$product->name} ». Places restantes : {$remaining}.",
                    ], 422);
                }
            }
        }

        // Calcul des totaux côté serveur
        $subtotal  = 0.0;
        $lineItems = [];

        foreach ($data['items'] as $item) {
            $product   = $products[$item['product_id']];
            $unitPrice = $item['duration'] === 'annual'
                ? round((float) $product->price_annual * 12, 2)
                : (float) $product->price_monthly;
            $lineTotal = round($unitPrice * $item['quantity'], 2);
            $subtotal += $lineTotal;

            $lineItems[] = [
                'product_id'  => $item['product_id'],
                'quantity'    => $item['quantity'],
                'unit_price'  => $unitPrice,
                'total_price' => $lineTotal,
                'duration'    => $item['duration'],
            ];
        }

        $tax   = round($subtotal * 0.20, 2);
        $total = round($subtotal + $tax, 2);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'    => $request->user()->id,
                'address_id' => $data['address_id'] ?? null,
                'status'     => 'pending',
                'subtotal'   => $subtotal,
                'tax'        => $tax,
                'total'      => $total,
            ]);

            foreach ($lineItems as $line) {
                OrderDetail::create(array_merge(['order_id' => $order->id], $line));
            }

            // Création du PaymentIntent avec le montant calculé côté serveur
            $stripe = new StripeClient(config('services.stripe.secret'));
            $intent = $stripe->paymentIntents->create([
                'amount'   => (int) round($total * 100),
                'currency' => 'eur',
                'metadata' => ['order_id' => $order->id, 'user_id' => $request->user()->id],
                'automatic_payment_methods' => ['enabled' => true],
            ]);

            $order->update(['stripe_pi_id' => $intent->id]);

            DB::commit();

            return response()->json([
                'order_id'      => $order->id,
                'client_secret' => $intent->client_secret,
                'subtotal'      => $subtotal,
                'tax'           => $tax,
                'total'         => $total,
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('OrderController@store: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la création de la commande.'], 500);
        }
    }

    /**
     * POST /api/orders/{id}/confirm
     * Appelé après confirmation Stripe côté frontend.
     * Vérifie le paiement, crée abonnements, licences, facture et envoie l'email.
     */
    public function confirm(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->with('details')
            ->findOrFail($id);

        $stripe = new StripeClient(config('services.stripe.secret'));
        $intent = $stripe->paymentIntents->retrieve($order->stripe_pi_id);

        if ($intent->status !== 'succeeded') {
            return response()->json(['message' => 'Paiement non confirmé par Stripe.'], 422);
        }

        DB::beginTransaction();
        try {
            $order->update(['status' => 'paid']);

            $user    = $request->user();
            $licenses = [];

            foreach ($order->details as $detail) {
                Subscription::create([
                    'user_id'              => $user->id,
                    'product_id'           => $detail->product_id,
                    'order_id'             => $order->id,
                    'status'               => 'active',
                    'billing_cycle'        => $detail->duration,
                    'current_period_start' => now()->toDateString(),
                    'current_period_end'   => $detail->duration === 'annual'
                        ? now()->addYear()->toDateString()
                        : now()->addMonth()->toDateString(),
                ]);

                $key = 'CYNA-'
                    . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 3))
                    . '-' . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 4))
                    . '-' . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 4));

                $license  = License::create([
                    'user_id'     => $user->id,
                    'order_id'    => $order->id,
                    'product_id'  => $detail->product_id,
                    'license_key' => $key,
                ]);
                $licenses[] = [
                    'license_key'  => $key,
                    'product_name' => $detail->product?->name ?? Product::find($detail->product_id)?->name,
                ];
            }

            $invoiceNumber = 'CYN-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
            $invoice = Invoice::create([
                'user_id'        => $user->id,
                'order_id'       => $order->id,
                'invoice_number' => $invoiceNumber,
                'amount'         => $order->total,
                'status'         => 'paid',
            ]);

            DB::commit();

            // ── Génération PDF + envoi email (hors transaction) ──────────────
            try {
                \Illuminate\Support\Facades\File::ensureDirectoryExists(storage_path('fonts'));
                $invoice->load(['order.items.product', 'user']);
                $pdfContent = Pdf::loadHtml(InvoiceController::buildHtml($invoice))->output();

                $storagePath = "invoices/facture-{$invoiceNumber}.pdf";
                \Illuminate\Support\Facades\Storage::disk('local')->put($storagePath, $pdfContent);
                $invoice->update(['pdf_path' => $storagePath]);

                $itemsHtml = $order->details->map(function ($d) {
                    $product = $d->product ?? Product::find($d->product_id);
                    $plan    = $d->duration === 'annual' ? 'Annuel' : 'Mensuel';
                    return "<tr>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#e2e8f0;'>{$product?->name}</td>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#94a3b8;text-align:center;'>{$plan}</td>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#00B4D8;text-align:right;font-weight:bold;'>" . number_format($d->total_price, 2, ',', ' ') . ' €</td>
                    </tr>';
                })->implode('');

                $licensesHtml = collect($licenses)->map(fn($l) =>
                    "<tr>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#e2e8f0;'>{$l['product_name']}</td>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#00B4D8;font-family:monospace;font-weight:bold;'>{$l['license_key']}</td>
                    </tr>"
                )->implode('');

                $total       = number_format((float) $order->total, 2, ',', ' ');
                $confirmHtml = "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'></head>
<body style='background:#0A1628;font-family:Arial,sans-serif;margin:0;padding:0;'>
  <div style='max-width:600px;margin:0 auto;padding:40px 20px;'>
    <div style='text-align:center;margin-bottom:32px;'>
      <h1 style='color:#00B4D8;font-size:28px;font-weight:800;letter-spacing:2px;margin:0;'>CYNA</h1>
      <p style='color:#64748b;font-size:13px;margin:4px 0 0;'>Cybersecurity as a Service</p>
    </div>
    <div style='background:#0f2040;border:1px solid #1e3a5f;border-radius:12px;padding:32px;'>
      <div style='text-align:center;margin-bottom:24px;'>
        <div style='background:#10B98120;border:2px solid #10B981;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;display:inline-block;'>✓</div>
        <h2 style='color:#10B981;font-size:22px;margin:16px 0 4px;'>Commande confirmée !</h2>
        <p style='color:#94a3b8;margin:0;'>Merci {$user->first_name}, votre paiement a bien été reçu.</p>
      </div>
      <div style='background:#0A1628;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;'>
        <span style='color:#94a3b8;font-size:14px;'>Numéro de commande : </span>
        <span style='color:#00B4D8;font-weight:bold;font-size:16px;'>{$invoiceNumber}</span>
      </div>
      <table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>
        <thead><tr>
          <th style='text-align:left;color:#64748b;font-size:12px;padding-bottom:8px;'>PRODUIT</th>
          <th style='text-align:center;color:#64748b;font-size:12px;padding-bottom:8px;'>PÉRIODE</th>
          <th style='text-align:right;color:#64748b;font-size:12px;padding-bottom:8px;'>MONTANT</th>
        </tr></thead>
        <tbody>{$itemsHtml}</tbody>
      </table>
      <div style='text-align:right;border-top:2px solid #00B4D8;padding-top:16px;'>
        <span style='color:#e2e8f0;font-size:18px;font-weight:bold;'>Total : </span>
        <span style='color:#00B4D8;font-size:22px;font-weight:800;'>{$total} €</span>
      </div>
    </div>
    <div style='background:#0f2040;border:1px solid #1e3a5f;border-radius:12px;padding:24px;margin-top:24px;'>
      <h3 style='color:#00B4D8;margin:0 0 16px;font-size:16px;'>🔑 Vos clés de licence</h3>
      <table style='width:100%;border-collapse:collapse;'>
        <thead><tr>
          <th style='text-align:left;color:#64748b;font-size:12px;padding-bottom:8px;'>PRODUIT</th>
          <th style='text-align:left;color:#64748b;font-size:12px;padding-bottom:8px;'>CLÉ DE LICENCE</th>
        </tr></thead>
        <tbody>{$licensesHtml}</tbody>
      </table>
    </div>
    <p style='color:#475569;font-size:12px;text-align:center;margin-top:24px;'>
      Votre facture PDF est jointe à cet email.<br>CYNA SAS — contact@cyna-it.fr
    </p>
  </div>
</body></html>";

                MailService::send(
                    $user->email,
                    "Confirmation de commande {$invoiceNumber} — CYNA",
                    $confirmHtml,
                    $user->first_name . ' ' . $user->last_name,
                    null,
                    [
                        'content'     => base64_encode($pdfContent),
                        'filename'    => "facture-{$invoiceNumber}.pdf",
                        'type'        => 'application/pdf',
                        'disposition' => 'attachment',
                    ]
                );

                if ((float) $order->total > 5000) {
                    $adminEmail = config('mail.admin_address', 'admin@cyna-it.fr');
                    MailService::send(
                        $adminEmail,
                        "⚠️ Commande importante #{$invoiceNumber} — {$total} €",
                        "<p>Commande > 5 000 € : {$user->first_name} {$user->last_name} ({$user->email}) — {$total} €</p>",
                        'Admin CYNA'
                    );
                }

            } catch (\Throwable $mailError) {
                Log::error('OrderController@confirm: échec email', [
                    'order_id' => $order->id,
                    'error'    => $mailError->getMessage(),
                ]);
            }

            return response()->json([
                'id'                   => $order->id,
                'ref'                  => $invoiceNumber,
                'status'               => 'paid',
                'total'                => (float) $order->total,
                'invoice_id'           => $invoice->id,
                'invoice_download_url' => "/api/invoices/{$invoice->id}/download",
                'licenses'             => $licenses,
                'created_at'           => $order->created_at,
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('OrderController@confirm: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la confirmation de la commande.'], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['details.product', 'invoice'])
            ->latest()
            ->get()
            ->map(fn($o) => [
                'id'                   => $o->id,
                'ref'                  => 'CYN-' . str_pad($o->id, 6, '0', STR_PAD_LEFT),
                'status'               => $o->status,
                'total'                => (float) $o->total,
                'invoice_id'           => $o->invoice?->id,
                'invoice_download_url' => $o->invoice ? "/api/invoices/{$o->invoice->id}/download" : null,
                'created_at'           => $o->created_at,
                'items'                => $o->details->map(fn($d) => [
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
<<<<<<< HEAD
            'id'                   => $order->id,
            'ref'                  => 'CYN-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            'status'               => $order->status,
            'total'                => (float) $order->total,
            'invoice_id'           => $order->invoice?->id,
            'invoice_download_url' => $order->invoice ? "/api/invoices/{$order->invoice->id}/download" : null,
            'created_at'           => $order->created_at,
            'items'                => $order->details->map(fn($d) => [
=======
            'id'         => $order->id,
            'ref'        => 'CYN-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            'status'     => $order->status,
            'subtotal'   => (float) $order->subtotal,
            'tax'        => (float) $order->tax,
            'total'      => (float) $order->total,
            'invoice_id' => $order->invoice?->id,
            'created_at' => $order->created_at,
            'items'      => $order->details->map(fn($d) => [
>>>>>>> origin/main
                'product_id' => $d->product_id,
                'product'    => ['name' => $d->product?->name],
                'quantity'   => $d->quantity,
                'unit_price' => (float) $d->unit_price,
                'duration'   => $d->duration,
            ]),
        ]);
    }
}
