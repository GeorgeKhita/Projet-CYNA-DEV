<?php

namespace Tests\Unit\Models;

use App\Models\OrderDetail;
use Tests\TestCase;

class OrderDetailTest extends TestCase
{
    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new OrderDetail())->getFillable();

        foreach (['order_id', 'product_id', 'quantity', 'unit_price', 'total_price', 'duration'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Casts ─────────────────────────────────────────────────────────────

    public function test_casts_contain_decimal_for_price_fields(): void
    {
        $casts = (new OrderDetail())->getCasts();

        $this->assertArrayHasKey('unit_price', $casts);
        $this->assertArrayHasKey('total_price', $casts);
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_duration_can_be_monthly_or_annual(): void
    {
        $monthly = new OrderDetail(['duration' => 'monthly']);
        $annual  = new OrderDetail(['duration' => 'annual']);

        $this->assertSame('monthly', $monthly->duration);
        $this->assertSame('annual', $annual->duration);
    }

    public function test_quantity_can_be_set(): void
    {
        $detail = new OrderDetail(['quantity' => 3]);
        $this->assertSame(3, $detail->quantity);
    }
}
