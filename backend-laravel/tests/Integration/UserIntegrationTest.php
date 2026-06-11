<?php

namespace Tests\Integration;

use App\Models\Order;
use App\Models\Subscription;
use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserIntegrationTest extends TestCase
{
    use RefreshDatabase;

    // ── Persistance en base ───────────────────────────────────────────────

    public function test_user_is_persisted_to_database(): void
    {
        $user = User::factory()->create(['email' => 'test@cyna.fr']);

        $this->assertDatabaseHas('users', ['email' => 'test@cyna.fr']);
    }

    public function test_user_can_be_retrieved_by_email(): void
    {
        User::factory()->create(['email' => 'retrieve@cyna.fr']);

        $found = User::where('email', 'retrieve@cyna.fr')->first();
        $this->assertNotNull($found);
        $this->assertSame('retrieve@cyna.fr', $found->email);
    }

    public function test_password_is_hashed_in_database(): void
    {
        User::factory()->create([
            'email'    => 'hash@cyna.fr',
            'password' => 'PlainPassword123!',
        ]);

        $user = User::where('email', 'hash@cyna.fr')->first();
        $this->assertNotSame('PlainPassword123!', $user->password);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('PlainPassword123!', $user->password));
    }

    public function test_two_factor_secret_is_not_returned_in_json(): void
    {
        $user = User::factory()->create([
            'two_factor_secret' => encrypt('mysecret'),
        ]);

        $json = $user->toArray();
        $this->assertArrayNotHasKey('two_factor_secret', $json);
    }

    // ── Relation orders ───────────────────────────────────────────────────

    public function test_user_has_many_orders(): void
    {
        $user = User::factory()->create();
        Order::factory()->count(3)->create(['user_id' => $user->id]);

        $this->assertCount(3, $user->orders);
    }

    public function test_user_orders_relation_returns_only_own_orders(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Order::factory()->count(2)->create(['user_id' => $user1->id]);
        Order::factory()->count(5)->create(['user_id' => $user2->id]);

        $this->assertCount(2, $user1->orders);
        $this->assertCount(5, $user2->orders);
    }

    // ── Relation subscriptions ────────────────────────────────────────────

    public function test_user_has_many_subscriptions(): void
    {
        $user    = User::factory()->create();
        $product = \App\Models\Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);

        \App\Models\Subscription::factory()->count(2)->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ]);

        $this->assertCount(2, $user->subscriptions);
    }

    // ── Relation supportMessages ──────────────────────────────────────────

    public function test_user_has_many_support_messages(): void
    {
        $user = User::factory()->create();

        SupportMessage::factory()->count(2)->create(['user_id' => $user->id]);

        $this->assertCount(2, $user->supportMessages);
    }

    // ── Champs 2FA en base ────────────────────────────────────────────────

    public function test_2fa_fields_persist_to_database(): void
    {
        $user = User::factory()->create([
            'two_factor_secret'       => encrypt('TOTP_SECRET_KEY'),
            'two_factor_enabled'      => true,
            'two_factor_confirmed_at' => now(),
        ]);

        $fresh = User::find($user->id);

        $this->assertTrue($fresh->two_factor_enabled);
        $this->assertNotNull($fresh->two_factor_confirmed_at);
        $this->assertNotNull($fresh->two_factor_secret);
        $this->assertSame('TOTP_SECRET_KEY', decrypt($fresh->two_factor_secret));
    }

    public function test_is_active_defaults_to_true(): void
    {
        $user = User::factory()->create();
        $this->assertTrue(User::find($user->id)->is_active);
    }

    public function test_inactive_user_can_be_deactivated(): void
    {
        $user = User::factory()->create(['is_active' => false]);
        $this->assertFalse(User::find($user->id)->is_active);
    }

    // ── Cascade delete ────────────────────────────────────────────────────

    public function test_deleting_user_cascades_to_orders(): void
    {
        $user  = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $user->delete();

        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
    }

    public function test_deleting_user_cascades_to_subscriptions(): void
    {
        $user    = User::factory()->create();
        $product = \App\Models\Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);
        $sub     = \App\Models\Subscription::factory()->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ]);

        $user->delete();

        $this->assertDatabaseMissing('subscriptions', ['id' => $sub->id]);
    }
}
