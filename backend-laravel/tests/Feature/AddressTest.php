<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddressTest extends TestCase
{
    use RefreshDatabase;

    private function auth(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test')->plainTextToken);
    }

    private array $valid = [
        'first_name'  => 'Nouh',
        'last_name'   => 'Mbarki',
        'address1'    => '1 rue de la Paix',
        'city'        => 'Toulouse',
        'postal_code' => '31000',
        'country'     => 'FR',
    ];

    public function test_unauthenticated_cannot_list_addresses(): void
    {
        $this->getJson('/api/user/addresses')->assertStatus(401);
    }

    public function test_user_can_create_address(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->auth($user)->postJson('/api/user/addresses', $this->valid)
            ->assertStatus(201)
            ->assertJsonPath('city', 'Toulouse');

        $this->assertDatabaseHas('addresses', ['user_id' => $user->id, 'postal_code' => '31000']);
    }

    public function test_create_address_validation_fails_without_required_fields(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->auth($user)->postJson('/api/user/addresses', ['country' => 'FRANCE'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name', 'city', 'postal_code', 'country']);
    }

    public function test_user_only_sees_own_addresses(): void
    {
        $user  = User::factory()->create(['is_active' => true]);
        $other = User::factory()->create(['is_active' => true]);
        Address::create(array_merge($this->valid, ['user_id' => $other->id, 'city' => 'Paris']));

        $this->auth($user)->getJson('/api/user/addresses')
            ->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_user_can_update_own_address(): void
    {
        $user    = User::factory()->create(['is_active' => true]);
        $address = Address::create(array_merge($this->valid, ['user_id' => $user->id]));

        $this->auth($user)->putJson("/api/user/addresses/{$address->id}", ['city' => 'Bordeaux'])
            ->assertStatus(200)
            ->assertJsonPath('city', 'Bordeaux');
    }

    public function test_user_cannot_delete_another_users_address(): void
    {
        $user    = User::factory()->create(['is_active' => true]);
        $other   = User::factory()->create(['is_active' => true]);
        $address = Address::create(array_merge($this->valid, ['user_id' => $other->id]));

        $this->auth($user)->deleteJson("/api/user/addresses/{$address->id}")->assertStatus(404);
        $this->assertDatabaseHas('addresses', ['id' => $address->id]);
    }

    public function test_user_can_delete_own_address(): void
    {
        $user    = User::factory()->create(['is_active' => true]);
        $address = Address::create(array_merge($this->valid, ['user_id' => $user->id]));

        $this->auth($user)->deleteJson("/api/user/addresses/{$address->id}")->assertStatus(204);
        $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
    }
}
