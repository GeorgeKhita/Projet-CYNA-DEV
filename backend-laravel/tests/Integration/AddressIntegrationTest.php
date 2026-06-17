<?php

namespace Tests\Integration;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddressIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private function makeAddress(int $userId, array $overrides = []): Address
    {
        return Address::create(array_merge([
            'user_id'     => $userId,
            'first_name'  => 'Nouh',
            'last_name'   => 'Mbarki',
            'address1'    => '1 rue de la Paix',
            'city'        => 'Toulouse',
            'postal_code' => '31000',
            'country'     => 'FR',
        ], $overrides));
    }

    public function test_address_is_persisted_to_database(): void
    {
        $user = User::factory()->create();
        $this->makeAddress($user->id, ['city' => 'Paris', 'postal_code' => '75001']);

        $this->assertDatabaseHas('addresses', [
            'user_id'     => $user->id,
            'city'        => 'Paris',
            'postal_code' => '75001',
        ]);
    }

    public function test_address_belongs_to_user(): void
    {
        $user    = User::factory()->create(['email' => 'addr@cyna.fr']);
        $address = $this->makeAddress($user->id);

        $this->assertSame('addr@cyna.fr', $address->user->email);
    }

    public function test_deleting_user_cascades_to_addresses(): void
    {
        $user = User::factory()->create();
        $this->makeAddress($user->id);

        $user->delete();

        $this->assertDatabaseCount('addresses', 0);
    }

    public function test_user_can_have_multiple_addresses(): void
    {
        $user = User::factory()->create();
        $this->makeAddress($user->id, ['city' => 'Lyon']);
        $this->makeAddress($user->id, ['city' => 'Nice']);

        $this->assertCount(2, $user->addresses);
    }
}
