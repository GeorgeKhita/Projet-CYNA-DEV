<?php

namespace App\Mail;

use App\Models\Invoice;
use App\Models\User;
use App\Services\MailService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class OrderConfirmationMail
{
    /**
     * Envoie l'email de confirmation de commande avec la facture PDF en pièce jointe.
     * Ne lève pas d'exception : les erreurs sont loguées et ignorées.
     */
    public static function send(
        User    $user,
        Invoice $invoice,
        array   $items,
        array   $licenses,
        string  $invoiceNumber,
        float   $subtotal,
        float   $tax,
        float   $total
    ): void {
        try {
            // Générer le PDF
            File::ensureDirectoryExists(storage_path('fonts'));
            $invoice->load(['order.items.product', 'user']);
            $pdfContent = Pdf::loadHtml(\App\Http\Controllers\Api\InvoiceController::buildHtml($invoice))->output();

            // Rendre le template Blade
            $html = view('emails.order_confirmation', compact(
                'user', 'invoiceNumber', 'items', 'licenses', 'subtotal', 'tax', 'total'
            ))->render();

            MailService::send(
                $user->email,
                "Confirmation de commande {$invoiceNumber} — CYNA",
                $html,
                $user->first_name . ' ' . $user->last_name,
                null,
                [
                    'content'     => base64_encode($pdfContent),
                    'filename'    => "facture-{$invoiceNumber}.pdf",
                    'type'        => 'application/pdf',
                    'disposition' => 'attachment',
                ]
            );
        } catch (\Throwable $e) {
            Log::error('OrderConfirmationMail: échec envoi', [
                'user_id'  => $user->id,
                'invoice'  => $invoiceNumber,
                'error'    => $e->getMessage(),
            ]);
        }
    }
}
