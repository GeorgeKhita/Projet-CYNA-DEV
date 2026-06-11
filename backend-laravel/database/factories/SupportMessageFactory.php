<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupportMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'        => User::factory(),
            'type'           => fake()->randomElement(['form', 'chatbot']),
            'email'          => fake()->safeEmail(),
            'subject'        => fake()->sentence(4),
            'message_body'   => fake()->paragraph(),
            'requires_human' => false,
            'status'         => 'new',
        ];
    }
}
