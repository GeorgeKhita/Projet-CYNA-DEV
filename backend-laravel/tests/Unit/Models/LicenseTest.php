<?php

namespace Tests\Unit\Models;

use App\Models\License;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class LicenseTest extends TestCase
{
    public function test_fillable_contains_expected_fields(): void
    {
        $fillable = (new License())->getFillable();

        foreach (['user_id', 'order_id', 'product_id', 'license_key', 'activated_at'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_activated_at_casts_to_carbon(): void
    {
        $license = new License(['activated_at' => '2024-06-01 12:00:00']);
        $this->assertInstanceOf(Carbon::class, $license->activated_at);
    }

    public function test_activated_at_is_null_when_not_set(): void
    {
        $license = new License(['activated_at' => null]);
        $this->assertNull($license->activated_at);
    }

    public function test_license_key_can_be_set(): void
    {
        $license = new License(['license_key' => 'CYNA-ABC-1234-5678']);
        $this->assertSame('CYNA-ABC-1234-5678', $license->license_key);
    }

    public function test_relations_are_belongs_to(): void
    {
        $this->assertSame(User::class, get_class((new License())->user()->getRelated()));
        $this->assertSame(Order::class, get_class((new License())->order()->getRelated()));
        $this->assertSame(Product::class, get_class((new License())->product()->getRelated()));
    }
}
