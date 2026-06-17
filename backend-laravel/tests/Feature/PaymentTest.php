<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_cannot_create_intent(): void
    {
        $this->postJson('/api/payments/intent', ['amount' => 100])->assertStatus(401);
    }

    public function test_intent_requires_an_amount(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('t')->plainTextToken)
            ->postJson('/api/payments/intent', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_intent_rejects_amount_below_minimum(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('t')->plainTextToken)
            ->postJson('/api/payments/intent', ['amount' => 0.1])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }
}
