<?php

namespace Tests\Unit\Models;

use App\Models\Subscription;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    // ── Casts date ────────────────────────────────────────────────────────

    public function test_current_period_start_casts_to_carbon(): void
    {
        $sub = new Subscription(['current_period_start' => '2024-01-01']);
        $this->assertInstanceOf(Carbon::class, $sub->current_period_start);
    }

    public function test_current_period_end_casts_to_carbon(): void
    {
        $sub = new Subscription(['current_period_end' => '2025-01-01']);
        $this->assertInstanceOf(Carbon::class, $sub->current_period_end);
    }

    public function test_cancelled_at_casts_to_carbon(): void
    {
        $sub = new Subscription(['cancelled_at' => '2024-06-15 10:30:00']);
        $this->assertInstanceOf(Carbon::class, $sub->cancelled_at);
    }

    public function test_cancelled_at_is_null_when_not_set(): void
    {
        $sub = new Subscription(['cancelled_at' => null]);
        $this->assertNull($sub->cancelled_at);
    }

    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new Subscription())->getFillable();

        foreach (['user_id', 'product_id', 'order_id', 'status', 'billing_cycle'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_status_active_can_be_set(): void
    {
        $sub = new Subscription(['status' => 'active']);
        $this->assertSame('active', $sub->status);
    }

    public function test_status_cancelled_can_be_set(): void
    {
        $sub = new Subscription(['status' => 'cancelled']);
        $this->assertSame('cancelled', $sub->status);
    }

    public function test_billing_cycle_monthly_can_be_set(): void
    {
        $sub = new Subscription(['billing_cycle' => 'monthly']);
        $this->assertSame('monthly', $sub->billing_cycle);
    }

    public function test_billing_cycle_annual_can_be_set(): void
    {
        $sub = new Subscription(['billing_cycle' => 'annual']);
        $this->assertSame('annual', $sub->billing_cycle);
    }

    // ── Logique période ───────────────────────────────────────────────────

    public function test_period_end_is_after_period_start(): void
    {
        $sub = new Subscription([
            'current_period_start' => '2024-01-01',
            'current_period_end'   => '2025-01-01',
        ]);

        $this->assertTrue($sub->current_period_end->greaterThan($sub->current_period_start));
    }
}
