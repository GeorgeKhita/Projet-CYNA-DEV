<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CarouselSlideFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id'    => null,
            'image_url'     => fake()->imageUrl(1200, 400),
            'title'         => fake()->sentence(4),
            'subtitle'      => fake()->sentence(6),
            'cta_text'      => 'Découvrir',
            'link'          => '/produits/' . fake()->slug(),
            'display_order' => fake()->numberBetween(0, 10),
        ];
    }
}
