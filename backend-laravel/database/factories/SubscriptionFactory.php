<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionFactory extends Factory
{
    public function definition(): array
    {
        $cycle = fake()->randomElement(['monthly', 'annual']);
        $start = now();

        return [
            'user_id'              => User::factory(),
            'product_id'           => Product::factory(),
            'order_id'             => Order::factory(),
            'status'               => 'active',
            'billing_cycle'        => $cycle,
            'current_period_start' => $start->toDateString(),
            'current_period_end'   => $cycle === 'annual'
                ? $start->copy()->addYear()->toDateString()
                : $start->copy()->addMonth()->toDateString(),
        ];
    }
}
