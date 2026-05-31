<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'        => fake()->randomElement(['SOC', 'EDR', 'XDR']),
            'description' => fake()->sentence(),
            'color'       => fake()->hexColor(),
            'visible'     => true,
        ];
    }
}
