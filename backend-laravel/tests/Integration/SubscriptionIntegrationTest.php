<?php

namespace Tests\Integration;

use App\Models\Order;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private function makeSubscription(array $overrides = []): Subscription
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);

        return Subscription::factory()->create(array_merge([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ], $overrides));
    }

    // ── Persistance ───────────────────────────────────────────────────────

    public function test_subscription_is_persisted_to_database(): void
    {
        $sub = $this->makeSubscription(['status' => 'active', 'billing_cycle' => 'monthly']);

        $this->assertDatabaseHas('subscriptions', [
            'id'            => $sub->id,
            'status'        => 'active',
            'billing_cycle' => 'monthly',
        ]);
    }

    // ── Relations ─────────────────────────────────────────────────────────

    public function test_subscription_belongs_to_user(): void
    {
        $user    = User::factory()->create(['email' => 'sub@cyna.fr']);
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $sub     = Subscription::factory()->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ]);

        $this->assertSame('sub@cyna.fr', $sub->user->email);
    }

    public function test_subscription_belongs_to_product(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create(['name' => 'CYNA EDR']);
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $sub     = Subscription::factory()->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ]);

        $this->assertSame('CYNA EDR', $sub->product->name);
    }

    public function test_subscription_belongs_to_order(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id, 'stripe_pi_id' => 'pi_test_xyz']);
        $sub     = Subscription::factory()->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ]);

        $this->assertSame('pi_test_xyz', $sub->order->stripe_pi_id);
    }

    // ── Cycle de vie ──────────────────────────────────────────────────────

    public function test_subscription_can_be_cancelled(): void
    {
        $sub = $this->makeSubscription(['status' => 'active']);

        $sub->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $fresh = Subscription::find($sub->id);
        $this->assertSame('cancelled', $fresh->status);
        $this->assertNotNull($fresh->cancelled_at);
    }

    public function test_active_subscription_has_no_cancelled_at(): void
    {
        $sub = $this->makeSubscription(['status' => 'active', 'cancelled_at' => null]);

        $this->assertNull($sub->cancelled_at);
    }

    // ── Dates de période ─────────────────────────────────────────────────

    public function test_period_dates_are_persisted_correctly(): void
    {
        $sub = $this->makeSubscription([
            'current_period_start' => '2024-01-01',
            'current_period_end'   => '2025-01-01',
        ]);

        $fresh = Subscription::find($sub->id);
        $this->assertSame('2024-01-01', $fresh->current_period_start->format('Y-m-d'));
        $this->assertSame('2025-01-01', $fresh->current_period_end->format('Y-m-d'));
    }

    public function test_annual_period_spans_one_year(): void
    {
        $start = now()->startOfDay();
        $end   = $start->copy()->addYear();

        $sub = $this->makeSubscription([
            'billing_cycle'        => 'annual',
            'current_period_start' => $start->format('Y-m-d'),
            'current_period_end'   => $end->format('Y-m-d'),
        ]);

        $fresh = Subscription::find($sub->id);
        $diff  = $fresh->current_period_start->diffInDays($fresh->current_period_end);

        $this->assertGreaterThanOrEqual(365, $diff);
    }

    // ── Billing cycle ─────────────────────────────────────────────────────

    public function test_monthly_subscription_is_persisted(): void
    {
        $sub = $this->makeSubscription(['billing_cycle' => 'monthly']);
        $this->assertSame('monthly', Subscription::find($sub->id)->billing_cycle);
    }

    public function test_annual_subscription_is_persisted(): void
    {
        $sub = $this->makeSubscription(['billing_cycle' => 'annual']);
        $this->assertSame('annual', Subscription::find($sub->id)->billing_cycle);
    }
}
