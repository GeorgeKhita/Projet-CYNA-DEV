<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RgpdTest extends TestCase
{
    use RefreshDatabase;

    // ── GET /api/auth/me/export ────────────────────────────────────────────

    public function test_user_can_export_own_data(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me/export')
            ->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json; charset=UTF-8');
    }

    // ── DELETE /api/auth/me — droit à l'oubli ─────────────────────────────

    public function test_user_can_delete_own_account(): void
    {
        $user  = User::factory()->create(['password' => bcrypt('Password123!')]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/auth/me', ['password' => 'Password123!'])
            ->assertStatus(200)
            ->assertJsonStructure(['message']);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_delete_account_fails_with_wrong_password(): void
    {
        $user  = User::factory()->create(['password' => bcrypt('Password123!')]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/auth/me', ['password' => 'WrongPassword'])
            ->assertStatus(422);

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_delete_account_requires_password(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/auth/me', [])
            ->assertStatus(422);
    }

    public function test_unauthenticated_cannot_delete_account(): void
    {
        $this->deleteJson('/api/auth/me', ['password' => 'Password123!'])
            ->assertStatus(401);
    }
}
