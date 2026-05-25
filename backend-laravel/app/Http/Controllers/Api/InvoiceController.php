<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    /**
     * GET /api/invoices
     * Factures de l'utilisateur connecté
     */
    public function index(Request $request): JsonResponse
    {
        $invoices = Invoice::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($inv) => [
                'id'         => $inv->id,
                'number'     => $inv->invoice_number,
                'amount'     => $inv->amount,
                'status'     => $inv->status,
                'created_at' => $inv->created_at,
            ]);

        return response()->json($invoices);
    }

    /**
     * GET /api/invoices/{invoice}/download
     * Télécharger une facture (retourne un PDF simulé)
     */
    public function download(Invoice $invoice, Request $request): Response|JsonResponse
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        // En production : générer un vrai PDF avec barryvdh/laravel-dompdf
        $content = "FACTURE #{$invoice->invoice_number}\n"
            . "Montant : {$invoice->amount} €\n"
            . "Date    : {$invoice->created_at}\n"
            . "CYNA - 123 rue de la Cybersécurité, Paris\n";

        return response($content, 200, [
            'Content-Type'        => 'text/plain',
            'Content-Disposition' => "attachment; filename=\"facture-{$invoice->invoice_number}.txt\"",
        ]);
    }
}
