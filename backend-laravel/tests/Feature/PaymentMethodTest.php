<?php

namespace Tests\Feature;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentMethodTest extends TestCase
{
    use RefreshDatabase;

    private function auth(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test')->plainTextToken);
    }

    private array $valid = [
        'cardholder_name'  => 'Nouh Mbarki',
        'last_four_digits' => '4242',
        'expiry_date'      => '12/29',
    ];

    public function test_unauthenticated_cannot_list_payment_methods(): void
    {
        $this->getJson('/api/user/payment-methods')->assertStatus(401);
    }

    public function test_user_can_create_payment_method(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->auth($user)->postJson('/api/user/payment-methods', $this->valid)
            ->assertStatus(201)
            ->assertJsonPath('last_four_digits', '4242');

        $this->assertDatabaseHas('payment_methods', ['user_id' => $user->id, 'last_four_digits' => '4242']);
    }

    public function test_create_validation_requires_card_fields(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->auth($user)->postJson('/api/user/payment-methods', ['last_four_digits' => '12'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['last_four_digits', 'expiry_date']);
    }

    public function test_setting_a_method_as_default_unsets_the_others(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        $first = PaymentMethod::create(array_merge($this->valid, ['user_id' => $user->id, 'is_default' => true]));

        $this->auth($user)->postJson('/api/user/payment-methods', array_merge($this->valid, [
            'last_four_digits' => '1111',
            'is_default'       => true,
        ]))->assertStatus(201);

        $this->assertFalse(PaymentMethod::find($first->id)->is_default);
        $this->assertDatabaseHas('payment_methods', ['user_id' => $user->id, 'last_four_digits' => '1111', 'is_default' => true]);
    }

    public function test_user_only_sees_own_payment_methods(): void
    {
        $user  = User::factory()->create(['is_active' => true]);
        $other = User::factory()->create(['is_active' => true]);
        PaymentMethod::create(array_merge($this->valid, ['user_id' => $other->id]));

        $this->auth($user)->getJson('/api/user/payment-methods')
            ->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_user_can_delete_own_payment_method(): void
    {
        $user   = User::factory()->create(['is_active' => true]);
        $method = PaymentMethod::create(array_merge($this->valid, ['user_id' => $user->id]));

        $this->auth($user)->deleteJson("/api/user/payment-methods/{$method->id}")->assertStatus(204);
        $this->assertDatabaseMissing('payment_methods', ['id' => $method->id]);
    }
}
