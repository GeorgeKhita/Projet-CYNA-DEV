<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceDownloadTest extends TestCase
{
    use RefreshDatabase;

    private function makeInvoice(User $user): Invoice
    {
        $order = Order::factory()->create(['user_id' => $user->id]);

        return Invoice::factory()->create([
            'user_id'        => $user->id,
            'order_id'       => $order->id,
            'invoice_number' => 'CYN-000001',
            'amount'         => 120.00,
        ]);
    }

    public function test_unauthenticated_cannot_download_invoice(): void
    {
        $user    = User::factory()->create(['is_active' => true]);
        $invoice = $this->makeInvoice($user);

        $this->getJson("/api/invoices/{$invoice->id}/download")->assertStatus(401);
    }

    public function test_owner_can_download_invoice_pdf(): void
    {
        $user    = User::factory()->create(['is_active' => true]);
        $invoice = $this->makeInvoice($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('t')->plainTextToken)
            ->get("/api/invoices/{$invoice->id}/download");

        $response->assertStatus(200);
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_user_cannot_download_another_users_invoice(): void
    {
        $owner   = User::factory()->create(['is_active' => true]);
        $other   = User::factory()->create(['is_active' => true]);
        $invoice = $this->makeInvoice($owner);

        $this->withHeader('Authorization', 'Bearer ' . $other->createToken('t')->plainTextToken)
            ->getJson("/api/invoices/{$invoice->id}/download")
            ->assertStatus(403);
    }
}
