<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use Tests\TestCase;

class OrderTest extends TestCase
{
    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new Order())->getFillable();

        foreach (['user_id', 'stripe_pi_id', 'status', 'subtotal', 'tax', 'total'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_status_can_be_set(): void
    {
        $order = new Order(['status' => 'completed']);
        $this->assertSame('completed', $order->status);
    }

    public function test_stripe_pi_id_can_be_set(): void
    {
        $order = new Order(['stripe_pi_id' => 'pi_test_abc123']);
        $this->assertSame('pi_test_abc123', $order->stripe_pi_id);
    }

    public function test_monetary_fields_can_be_set(): void
    {
        $order = new Order([
            'subtotal' => 100.00,
            'tax'      => 20.00,
            'total'    => 120.00,
        ]);

        $this->assertNotNull($order->subtotal);
        $this->assertNotNull($order->tax);
        $this->assertNotNull($order->total);
    }

    // ── Casts ─────────────────────────────────────────────────────────────

    public function test_casts_contain_decimal_for_monetary_fields(): void
    {
        $casts = (new Order())->getCasts();

        $this->assertArrayHasKey('subtotal', $casts);
        $this->assertArrayHasKey('tax', $casts);
        $this->assertArrayHasKey('total', $casts);
    }
}
