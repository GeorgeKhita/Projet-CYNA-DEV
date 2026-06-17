<?php

namespace Tests\Integration;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentMethodIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private function makeMethod(int $userId, array $overrides = []): PaymentMethod
    {
        return PaymentMethod::create(array_merge([
            'user_id'          => $userId,
            'cardholder_name'  => 'Nouh Mbarki',
            'last_four_digits' => '4242',
            'expiry_date'      => '12/29',
            'is_default'       => false,
        ], $overrides));
    }

    public function test_payment_method_is_persisted_to_database(): void
    {
        $user = User::factory()->create();
        $this->makeMethod($user->id, ['last_four_digits' => '1234']);

        $this->assertDatabaseHas('payment_methods', [
            'user_id'          => $user->id,
            'last_four_digits' => '1234',
        ]);
    }

    public function test_payment_method_belongs_to_user(): void
    {
        $user   = User::factory()->create(['email' => 'pay@cyna.fr']);
        $method = $this->makeMethod($user->id);

        $this->assertSame('pay@cyna.fr', $method->user->email);
    }

    public function test_is_default_is_stored_as_boolean(): void
    {
        $user   = User::factory()->create();
        $method = $this->makeMethod($user->id, ['is_default' => true]);

        $this->assertTrue(PaymentMethod::find($method->id)->is_default);
    }

    public function test_deleting_user_cascades_to_payment_methods(): void
    {
        $user = User::factory()->create();
        $this->makeMethod($user->id);

        $user->delete();

        $this->assertDatabaseCount('payment_methods', 0);
    }
}
