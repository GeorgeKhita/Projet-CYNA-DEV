<?php

namespace Tests\Integration;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderIntegrationTest extends TestCase
{
    use RefreshDatabase;

    // ── Persistance ───────────────────────────────────────────────────────

    public function test_order_is_persisted_to_database(): void
    {
        $user  = User::factory()->create();
        $order = Order::factory()->create([
            'user_id'     => $user->id,
            'stripe_pi_id' => 'pi_test_abc123',
            'status'      => 'paid',
            'subtotal'    => 100.00,
            'tax'         => 20.00,
            'total'       => 120.00,
        ]);

        $this->assertDatabaseHas('orders', [
            'id'           => $order->id,
            'stripe_pi_id' => 'pi_test_abc123',
            'status'       => 'paid',
        ]);
    }

    // ── Relation user ─────────────────────────────────────────────────────

    public function test_order_belongs_to_user(): void
    {
        $user  = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $this->assertSame($user->id, $order->user->id);
        $this->assertSame($user->email, $order->user->email);
    }

    // ── Relation details ──────────────────────────────────────────────────

    public function test_order_has_many_details(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);

        OrderDetail::factory()->count(3)->create([
            'order_id'   => $order->id,
            'product_id' => $product->id,
        ]);

        $this->assertCount(3, $order->details);
    }

    public function test_order_details_have_correct_product(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create(['name' => 'CYNA SOC']);
        $order   = Order::factory()->create(['user_id' => $user->id]);

        $detail = OrderDetail::factory()->create([
            'order_id'   => $order->id,
            'product_id' => $product->id,
        ]);

        $this->assertSame('CYNA SOC', $detail->product->name);
    }

    // ── Relation invoice ──────────────────────────────────────────────────

    public function test_order_has_one_invoice(): void
    {
        $user    = User::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $invoice = Invoice::factory()->create([
            'order_id'       => $order->id,
            'user_id'        => $user->id,
            'invoice_number' => 'CYN-000001',
        ]);

        $this->assertNotNull($order->invoice);
        $this->assertSame('CYN-000001', $order->invoice->invoice_number);
    }

    // ── Relation subscriptions ────────────────────────────────────────────

    public function test_order_has_many_subscriptions(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);

        Subscription::factory()->count(2)->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ]);

        $this->assertCount(2, $order->subscriptions);
    }

    // ── Montants ──────────────────────────────────────────────────────────

    public function test_order_monetary_values_are_stored_correctly(): void
    {
        $user  = User::factory()->create();
        $order = Order::factory()->create([
            'user_id'  => $user->id,
            'subtotal' => 500.00,
            'tax'      => 100.00,
            'total'    => 600.00,
        ]);

        $fresh = Order::find($order->id);
        $this->assertEquals(500.00, $fresh->subtotal);
        $this->assertEquals(100.00, $fresh->tax);
        $this->assertEquals(600.00, $fresh->total);
    }

    // ── Statuts ───────────────────────────────────────────────────────────

    public function test_order_status_can_be_updated(): void
    {
        $user  = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'pending']);

        $order->update(['status' => 'paid']);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    // ── Cascade delete ────────────────────────────────────────────────────

    public function test_deleting_order_cascades_to_details(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $detail  = OrderDetail::factory()->create([
            'order_id'   => $order->id,
            'product_id' => $product->id,
        ]);

        $order->delete();

        $this->assertDatabaseMissing('order_details', ['id' => $detail->id]);
    }

    public function test_deleting_order_cascades_to_subscriptions(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $sub     = Subscription::factory()->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ]);

        $order->delete();

        $this->assertDatabaseMissing('subscriptions', ['id' => $sub->id]);
    }
}
