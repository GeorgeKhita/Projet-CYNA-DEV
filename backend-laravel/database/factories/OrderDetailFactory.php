<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderDetailFactory extends Factory
{
    public function definition(): array
    {
        $unitPrice  = fake()->randomFloat(2, 10, 500);
        $quantity   = fake()->numberBetween(1, 5);

        return [
            'order_id'    => Order::factory(),
            'product_id'  => Product::factory(),
            'quantity'    => $quantity,
            'unit_price'  => $unitPrice,
            'total_price' => round($unitPrice * $quantity, 2),
            'duration'    => fake()->randomElement(['monthly', 'annual']),
        ];
    }
}
