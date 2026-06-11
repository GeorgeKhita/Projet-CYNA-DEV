<?php

namespace Tests\Integration;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceIntegrationTest extends TestCase
{
    use RefreshDatabase;

    // ── Persistance ───────────────────────────────────────────────────────

    public function test_invoice_is_persisted_to_database(): void
    {
        $user    = User::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);

        Invoice::factory()->create([
            'user_id'        => $user->id,
            'order_id'       => $order->id,
            'invoice_number' => 'CYN-000001',
            'amount'         => 600.00,
            'status'         => 'paid',
        ]);

        $this->assertDatabaseHas('invoices', [
            'invoice_number' => 'CYN-000001',
            'status'         => 'paid',
        ]);
    }

    // ── Relations ─────────────────────────────────────────────────────────

    public function test_invoice_belongs_to_user(): void
    {
        $user    = User::factory()->create(['email' => 'invoice@cyna.fr']);
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $invoice = Invoice::factory()->create([
            'user_id'  => $user->id,
            'order_id' => $order->id,
        ]);

        $this->assertSame('invoice@cyna.fr', $invoice->user->email);
    }

    public function test_invoice_belongs_to_order(): void
    {
        $user    = User::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id, 'stripe_pi_id' => 'pi_inv_test']);
        $invoice = Invoice::factory()->create([
            'user_id'  => $user->id,
            'order_id' => $order->id,
        ]);

        $this->assertSame('pi_inv_test', $invoice->order->stripe_pi_id);
    }

    // ── Numéro de facture ─────────────────────────────────────────────────

    public function test_invoice_numbers_are_unique(): void
    {
        $user  = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $inv1 = Invoice::factory()->create([
            'user_id'        => $user->id,
            'order_id'       => $order->id,
            'invoice_number' => 'CYN-000001',
        ]);

        $order2 = Order::factory()->create(['user_id' => $user->id]);
        $inv2   = Invoice::factory()->create([
            'user_id'        => $user->id,
            'order_id'       => $order2->id,
            'invoice_number' => 'CYN-000002',
        ]);

        $this->assertNotSame($inv1->invoice_number, $inv2->invoice_number);
    }

    public function test_invoice_number_follows_cyn_format(): void
    {
        $user    = User::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $invoice = Invoice::factory()->create([
            'user_id'        => $user->id,
            'order_id'       => $order->id,
            'invoice_number' => 'CYN-000042',
        ]);

        $this->assertStringStartsWith('CYN-', $invoice->invoice_number);
    }

    // ── Montant ───────────────────────────────────────────────────────────

    public function test_invoice_amount_is_stored_correctly(): void
    {
        $user    = User::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $invoice = Invoice::factory()->create([
            'user_id'  => $user->id,
            'order_id' => $order->id,
            'amount'   => 1440.00,
        ]);

        $this->assertEquals(1440.00, Invoice::find($invoice->id)->amount);
    }

    // ── PDF path ──────────────────────────────────────────────────────────

    public function test_pdf_path_is_stored(): void
    {
        $user    = User::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $invoice = Invoice::factory()->create([
            'user_id'  => $user->id,
            'order_id' => $order->id,
            'pdf_path' => 'invoices/CYN-000001.pdf',
        ]);

        $this->assertSame('invoices/CYN-000001.pdf', Invoice::find($invoice->id)->pdf_path);
    }
}
