<?php

namespace Tests\Unit\Models;

use App\Models\Invoice;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new Invoice())->getFillable();

        foreach (['user_id', 'order_id', 'invoice_number', 'amount', 'status', 'pdf_path'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Casts ─────────────────────────────────────────────────────────────

    public function test_casts_contain_decimal_for_amount(): void
    {
        $casts = (new Invoice())->getCasts();
        $this->assertArrayHasKey('amount', $casts);
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_invoice_number_format_can_be_set(): void
    {
        $invoice = new Invoice(['invoice_number' => 'CYN-000042']);
        $this->assertSame('CYN-000042', $invoice->invoice_number);
    }

    public function test_status_paid_can_be_set(): void
    {
        $invoice = new Invoice(['status' => 'paid']);
        $this->assertSame('paid', $invoice->status);
    }

    public function test_pdf_path_can_be_stored(): void
    {
        $invoice = new Invoice(['pdf_path' => 'invoices/CYN-000042.pdf']);
        $this->assertSame('invoices/CYN-000042.pdf', $invoice->pdf_path);
    }

    public function test_amount_can_be_set(): void
    {
        $invoice = new Invoice(['amount' => 1200.00]);
        $this->assertNotNull($invoice->amount);
    }
}
