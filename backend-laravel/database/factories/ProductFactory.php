<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = 'Cyna ' . fake()->word() . ' ' . fake()->randomElement(['SOC', 'EDR', 'XDR']);

        return [
            'category_id'   => Category::factory(),
            'name'          => $name,
            'slug'          => Str::slug($name) . '-' . fake()->unique()->numerify('###'),
            'description'   => fake()->paragraph(),
            'features'      => ['Surveillance 24/7', 'Alertes temps réel', 'Conformité NIS2'],
            'price_monthly' => fake()->randomFloat(2, 500, 2500),
            'price_annual'  => fake()->randomFloat(2, 400, 2000),
            'status'        => 'available',
            'priority'      => fake()->numberBetween(1, 10),
        ];
    }
}
