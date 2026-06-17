<?php

namespace Tests\Unit\Models;

use App\Models\PaymentMethod;
use App\Models\User;
use Tests\TestCase;

class PaymentMethodTest extends TestCase
{
    public function test_fillable_contains_expected_fields(): void
    {
        $fillable = (new PaymentMethod())->getFillable();

        foreach (['user_id', 'cardholder_name', 'last_four_digits', 'expiry_date', 'payment_token', 'is_default'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_is_default_casts_to_boolean_true(): void
    {
        $method = new PaymentMethod(['is_default' => 1]);
        $this->assertIsBool($method->is_default);
        $this->assertTrue($method->is_default);
    }

    public function test_is_default_casts_to_boolean_false(): void
    {
        $method = new PaymentMethod(['is_default' => 0]);
        $this->assertIsBool($method->is_default);
        $this->assertFalse($method->is_default);
    }

    public function test_last_four_digits_can_be_set(): void
    {
        $method = new PaymentMethod(['last_four_digits' => '4242']);
        $this->assertSame('4242', $method->last_four_digits);
    }

    public function test_user_relation_is_belongs_to(): void
    {
        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\BelongsTo::class,
            (new PaymentMethod())->user()
        );
        $this->assertSame(User::class, get_class((new PaymentMethod())->user()->getRelated()));
    }
}
