<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\License;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Subscription;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
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

            // ── Envoi email (hors transaction — un échec mail ne doit pas annuler la commande) ──
            $user = $request->user();
            try {
                \Illuminate\Support\Facades\File::ensureDirectoryExists(storage_path('fonts'));
                $invoice->load(['order.items.product', 'user']);
                $pdfContent = Pdf::loadHtml(InvoiceController::buildHtml($invoice))->output();

                // Alerte admin si commande > 5000€
                if ($data['total'] > 5000) {
                    $adminEmail = config('mail.admin_address', 'admin@cyna-it.fr');
                    $adminHtml  = "<p>Une commande supérieure à 5 000 € vient d'être passée.</p>
                                   <p><strong>Client :</strong> {$user->full_name} ({$user->email})</p>
                                   <p><strong>Montant :</strong> " . number_format($data['total'], 2, ',', ' ') . " €</p>
                                   <p><strong>Référence :</strong> {$invoiceNumber}</p>
                                   <p>Pensez à contacter le client.</p>";
                    \App\Services\MailService::send(
                        $adminEmail,
                        "⚠️ Commande importante #{$invoiceNumber} — " . number_format($data['total'], 2, ',', ' ') . ' €',
                        $adminHtml,
                        'Admin CYNA'
                    );
                }

                // Mail de confirmation client avec PDF en pièce jointe
                $itemsHtml = collect($data['items'])->map(function ($item) {
                    $product = \App\Models\Product::find($item['product_id']);
                    $plan    = $item['duration'] === 'annual' ? 'Annuel' : 'Mensuel';
                    return "<tr>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#e2e8f0;'>{$product?->name}</td>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#94a3b8;text-align:center;'>{$plan}</td>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#00B4D8;text-align:right;font-weight:bold;'>" . number_format($item['total_price'], 2, ',', ' ') . " €</td>
                    </tr>";
                })->implode('');

                $licensesHtml = collect($licenses)->map(fn($l) =>
                    "<tr>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#e2e8f0;'>{$l['product_name']}</td>
                        <td style='padding:8px 0;border-bottom:1px solid #1e3a5f;color:#00B4D8;font-family:monospace;font-weight:bold;'>{$l['license_key']}</td>
                    </tr>"
                )->implode('');

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
        <span style='color:#00B4D8;font-size:22px;font-weight:800;'>" . number_format($data['total'], 2, ',', ' ') . " €</span>
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
      <p style='color:#94a3b8;font-size:12px;margin:16px 0 0;'>Conservez précieusement ces clés. Elles vous permettront d'activer vos logiciels.</p>
    </div>
    <p style='color:#475569;font-size:12px;text-align:center;margin-top:24px;'>
      Votre facture PDF est jointe à cet email.<br>
      CYNA SAS — contact@cyna-it.fr
    </p>
  </div>
</body></html>";

                \App\Services\MailService::send(
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

            } catch (\Throwable $mailError) {
                \Illuminate\Support\Facades\Log::error('OrderController: échec envoi email', [
                    'order_id' => $order->id,
                    'error'    => $mailError->getMessage(),
                ]);
            }

            return response()->json([
                'id'         => $order->id,
                'ref'        => $invoiceNumber,
                'status'     => $order->status,
                'total'      => (float) $order->total,
                'invoice_id' => $invoice->id,
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
