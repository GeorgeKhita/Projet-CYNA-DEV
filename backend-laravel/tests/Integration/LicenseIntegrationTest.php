<?php

namespace Tests\Integration;

use App\Models\License;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LicenseIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private function makeLicense(array $overrides = []): License
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);

        return License::create(array_merge([
            'user_id'     => $user->id,
            'order_id'    => $order->id,
            'product_id'  => $product->id,
            'license_key' => 'CYNA-' . uniqid(),
        ], $overrides));
    }

    public function test_license_is_persisted_to_database(): void
    {
        $license = $this->makeLicense(['license_key' => 'CYNA-ABC-1234-5678']);

        $this->assertDatabaseHas('licenses', [
            'id'          => $license->id,
            'license_key' => 'CYNA-ABC-1234-5678',
        ]);
    }

    public function test_license_belongs_to_user_order_and_product(): void
    {
        $license = $this->makeLicense();

        $this->assertNotNull($license->user);
        $this->assertNotNull($license->order);
        $this->assertNotNull($license->product);
    }

    public function test_license_key_is_unique(): void
    {
        $this->makeLicense(['license_key' => 'CYNA-UNIQUE-KEY']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        $this->makeLicense(['license_key' => 'CYNA-UNIQUE-KEY']);
    }

    public function test_deleting_order_cascades_to_licenses(): void
    {
        $license = $this->makeLicense();

        $license->order->delete();

        $this->assertDatabaseCount('licenses', 0);
    }
}
