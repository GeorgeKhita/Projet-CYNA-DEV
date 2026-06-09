<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name'       => fake()->firstName(),
            'last_name'        => fake()->lastName(),
            'email'            => fake()->unique()->safeEmail(),
            'password'         => bcrypt('Password123!'),
            'company'          => fake()->company(),
            'role'             => 'user',
            'is_active'        => true,
            'is_email_verified' => true,
        ];
    }
}
