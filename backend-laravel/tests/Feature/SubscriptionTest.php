<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    // ── GET /api/subscriptions ─────────────────────────────────────────────

    public function test_authenticated_user_can_list_subscriptions(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $order   = Order::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create();
        Subscription::factory()->count(2)->create([
            'user_id'    => $user->id,
            'order_id'   => $order->id,
            'product_id' => $product->id,
            'status'     => 'active',
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/subscriptions')
            ->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_unauthenticated_cannot_list_subscriptions(): void
    {
        $this->getJson('/api/subscriptions')->assertStatus(401);
    }

    // ── PATCH /api/subscriptions/{id}/cancel ──────────────────────────────

    public function test_user_can_cancel_own_subscription(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $order        = Order::factory()->create(['user_id' => $user->id]);
        $product      = Product::factory()->create();
        $subscription = Subscription::factory()->create([
            'user_id'    => $user->id,
            'order_id'   => $order->id,
            'product_id' => $product->id,
            'status'     => 'active',
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/subscriptions/{$subscription->id}/cancel")
            ->assertStatus(200);

        $this->assertDatabaseHas('subscriptions', [
            'id'     => $subscription->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_user_cannot_cancel_other_user_subscription(): void
    {
        [$user1, $token1] = [User::factory()->create(), null];
        $token1 = $user1->createToken('test')->plainTextToken;

        $user2        = User::factory()->create();
        $order        = Order::factory()->create(['user_id' => $user2->id]);
        $product      = Product::factory()->create();
        $subscription = Subscription::factory()->create([
            'user_id'    => $user2->id,
            'order_id'   => $order->id,
            'product_id' => $product->id,
            'status'     => 'active',
        ]);

        $this->withHeader('Authorization', "Bearer {$token1}")
            ->patchJson("/api/subscriptions/{$subscription->id}/cancel")
            ->assertStatus(403);
    }
}
