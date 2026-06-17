<?php

namespace Tests\Unit\Models;

use App\Models\Address;
use App\Models\User;
use Tests\TestCase;

class AddressTest extends TestCase
{
    public function test_fillable_contains_expected_fields(): void
    {
        $fillable = (new Address())->getFillable();

        foreach (['user_id', 'first_name', 'last_name', 'address1', 'city', 'postal_code', 'country'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_attributes_can_be_set(): void
    {
        $address = new Address([
            'city'        => 'Toulouse',
            'postal_code' => '31000',
            'country'     => 'FR',
        ]);

        $this->assertSame('Toulouse', $address->city);
        $this->assertSame('31000', $address->postal_code);
        $this->assertSame('FR', $address->country);
    }

    public function test_user_relation_is_belongs_to(): void
    {
        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\BelongsTo::class,
            (new Address())->user()
        );
        $this->assertSame(User::class, get_class((new Address())->user()->getRelated()));
    }
}
