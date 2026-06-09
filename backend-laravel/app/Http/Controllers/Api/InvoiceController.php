<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $invoices = Invoice::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($inv) => [
                'id'         => $inv->id,
                'number'     => $inv->invoice_number,
                'amount'     => (float) $inv->amount,
                'status'     => $inv->status ?? 'paid',
                'order_id'   => $inv->order_id,
                'created_at' => $inv->created_at,
            ]);

        return response()->json($invoices);
    }

    public function download(Invoice $invoice, Request $request): Response|JsonResponse
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $invoice->load(['order.items.product', 'user']);

        $pdf = Pdf::loadHtml(self::buildHtml($invoice));

        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="facture-' . $invoice->invoice_number . '.pdf"',
        ]);
    }

    public static function buildHtml(Invoice $invoice): string
    {
        $user          = $invoice->user;
        $order         = $invoice->order;
        $invoiceNumber = $invoice->invoice_number;
        $date          = $invoice->created_at->format('d/m/Y');
        $dueDate       = $invoice->created_at->addDays(30)->format('d/m/Y');

        $linesHtml = '';
        if ($order && $order->items) {
            foreach ($order->items as $item) {
                $productName = $item->product?->name ?? 'Produit';
                $plan        = $item->duration === 'annual' ? 'Annuel' : 'Mensuel';
                $price       = number_format((float) $item->unit_price, 2, ',', ' ');
                $linesHtml  .= "
                <tr>
                    <td style='padding:12px 16px;border-bottom:1px solid #e2e8f0;'>{$productName}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:center;'>Abonnement {$plan}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:center;'>{$item->quantity}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;'>{$price} €</td>
                </tr>";
            }
        }

        $totalHT    = number_format((float) $invoice->amount / 1.2, 2, ',', ' ');
        $tva        = number_format((float) $invoice->amount - (float) $invoice->amount / 1.2, 2, ',', ' ');
        $totalTTC   = number_format((float) $invoice->amount, 2, ',', ' ');
        $clientName = ($user->first_name ?? '') . ' ' . ($user->last_name ?? '');
        $clientEmail = $user->email ?? '';
        $clientCo   = $user->company ? "<br>{$user->company}" : '';
        $orderId    = str_pad($order->id ?? 0, 6, '0', STR_PAD_LEFT);

        return "<!DOCTYPE html>
<html lang='fr'>
<head>
<meta charset='UTF-8'>
<title>Facture {$invoiceNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: DejaVu Sans, Arial, sans-serif; color:#1a202c; background:#fff; font-size:13px; }
  .page { max-width:800px; margin:0 auto; padding:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
  .logo { font-size:26px; font-weight:800; color:#0A1628; letter-spacing:2px; }
  .logo span { color:#00B4D8; }
  .invoice-meta { text-align:right; }
  .invoice-meta h1 { font-size:28px; color:#0A1628; margin-bottom:4px; }
  .invoice-meta .number { color:#00B4D8; font-size:15px; font-weight:600; }
  .divider { border:none; border-top:2px solid #00B4D8; margin:20px 0; }
  .parties { display:flex; justify-content:space-between; margin-bottom:28px; }
  .party h3 { font-size:10px; text-transform:uppercase; color:#718096; margin-bottom:6px; letter-spacing:1px; }
  .party p { font-size:13px; line-height:1.6; color:#2d3748; }
  .dates { display:flex; gap:24px; background:#f7fafc; border-radius:8px; padding:14px 18px; margin-bottom:28px; }
  .date-item label { font-size:10px; color:#718096; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:3px; }
  .date-item span { font-size:13px; font-weight:600; color:#2d3748; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  thead tr { background:#0A1628; color:#fff; }
  thead th { padding:10px 16px; text-align:left; font-size:12px; }
  thead th:last-child { text-align:right; }
  .totals-box { float:right; width:260px; margin-top:8px; }
  .totals-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#4a5568; }
  .totals-row.ttc { font-size:16px; font-weight:800; color:#0A1628; border-top:2px solid #00B4D8; padding-top:10px; margin-top:4px; }
  .totals-row.ttc span:last-child { color:#00B4D8; }
  .status-badge { display:inline-block; background:#c6f6d5; color:#276749; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .footer { margin-top:48px; padding-top:20px; border-top:1px solid #e2e8f0; text-align:center; color:#718096; font-size:11px; }
</style>
</head>
<body>
<div class='page'>
  <div class='header'>
    <div>
      <div class='logo'>CYNA<span>.</span></div>
      <p style='color:#718096;font-size:12px;margin-top:4px;'>Cybersecurity as a Service</p>
      <p style='color:#718096;font-size:11px;margin-top:8px;'>123 rue de la Cybersécurité<br>75001 Paris, France<br>contact@cyna-it.fr<br>TVA : FR12 345 678 901</p>
    </div>
    <div class='invoice-meta'>
      <h1>FACTURE</h1>
      <div class='number'>{$invoiceNumber}</div>
      <div style='margin-top:10px;'><span class='status-badge'>PAYÉE</span></div>
    </div>
  </div>

  <hr class='divider'>

  <div class='parties'>
    <div class='party'>
      <h3>Émetteur</h3>
      <p><strong>CYNA SAS</strong><br>123 rue de la Cybersécurité<br>75001 Paris, France</p>
    </div>
    <div class='party' style='text-align:right;'>
      <h3>Destinataire</h3>
      <p><strong>{$clientName}</strong>{$clientCo}<br>{$clientEmail}</p>
    </div>
  </div>

  <div class='dates'>
    <div class='date-item'><label>Date d'émission</label><span>{$date}</span></div>
    <div class='date-item'><label>Date d'échéance</label><span>{$dueDate}</span></div>
    <div class='date-item'><label>N° commande</label><span>CYN-{$orderId}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style='text-align:center;'>Période</th>
        <th style='text-align:center;'>Qté</th>
        <th style='text-align:right;'>Montant HT</th>
      </tr>
    </thead>
    <tbody>{$linesHtml}</tbody>
  </table>

  <div class='totals-box'>
    <div class='totals-row'><span>Sous-total HT</span><span>{$totalHT} €</span></div>
    <div class='totals-row'><span>TVA (20%)</span><span>{$tva} €</span></div>
    <div class='totals-row ttc'><span>Total TTC</span><span>{$totalTTC} €</span></div>
  </div>

  <div style='clear:both;'></div>

  <div class='footer'>
    <p>CYNA SAS — RCS Paris 123 456 789 — TVA FR12 345 678 901</p>
    <p style='margin-top:4px;'>Règlement reçu par carte bancaire · Merci de votre confiance</p>
  </div>
</div>
</body>
</html>";
    }
}
