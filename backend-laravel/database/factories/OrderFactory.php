<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 100, 5000);
        $tax      = round($subtotal * 0.2, 2);

        return [
            'user_id'      => User::factory(),
            'status'       => 'paid',
            'subtotal'     => $subtotal,
            'tax'          => $tax,
            'total'        => $subtotal + $tax,
            'stripe_pi_id' => 'pi_test_' . fake()->uuid(),
        ];
    }
}
