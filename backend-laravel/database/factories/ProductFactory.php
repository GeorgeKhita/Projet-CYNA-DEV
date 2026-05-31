<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'          => 'Cyna ' . fake()->word() . ' ' . fake()->randomElement(['SOC', 'EDR', 'XDR']),
            'description'   => fake()->paragraph(),
            'category'      => fake()->randomElement(['SOC', 'EDR', 'XDR']),
            'price_monthly' => fake()->randomFloat(2, 500, 2500),
            'price_annual'  => fake()->randomFloat(2, 400, 2000),
            'available'     => true,
            'popular'       => false,
            'order'         => fake()->numberBetween(1, 10),
        ];
    }
}
