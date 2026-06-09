<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private function authUser(): array
    {
        $user  = User::factory()->create(['role' => 'user']);
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    // ── GET /api/orders ────────────────────────────────────────────────────

    public function test_authenticated_user_can_list_orders(): void
    {
        [$user, $token] = $this->authUser();

        Order::factory()->count(2)->create(['user_id' => $user->id, 'status' => 'paid']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/orders')
            ->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_unauthenticated_user_cannot_list_orders(): void
    {
        $this->getJson('/api/orders')->assertStatus(401);
    }

    public function test_user_cannot_see_other_users_orders(): void
    {
        [$user, $token] = $this->authUser();
        $otherUser = User::factory()->create();
        Order::factory()->count(3)->create(['user_id' => $otherUser->id]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/orders');

        $response->assertStatus(200)->assertJsonCount(0);
    }

    // ── POST /api/orders — validation sans Stripe ─────────────────────────

    public function test_order_requires_payment_intent(): void
    {
        [, $token] = $this->authUser();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/orders', [
                'subtotal' => 100,
                'tax'      => 20,
                'total'    => 120,
                'items'    => [],
            ])
            ->assertStatus(422);
    }

    public function test_order_requires_items(): void
    {
        [, $token] = $this->authUser();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/orders', [
                'payment_intent_id' => 'pi_test_123',
                'subtotal'          => 0,
                'total'             => 0,
                'items'             => [],
            ])
            ->assertStatus(422);
    }

    // ── GET /api/orders/{id} ───────────────────────────────────────────────

    public function test_user_can_get_own_order(): void
    {
        [$user, $token] = $this->authUser();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/orders/{$order->id}")
            ->assertStatus(200)
            ->assertJsonPath('id', $order->id);
    }

    public function test_user_cannot_get_other_user_order(): void
    {
        [, $token] = $this->authUser();
        $otherUser = User::factory()->create();
        $order     = Order::factory()->create(['user_id' => $otherUser->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/orders/{$order->id}")
            ->assertStatus(404);
    }
}
