<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'first_name'            => 'Jean',
            'last_name'             => 'Dupont',
            'email'                 => 'jean@test.fr',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
            'company'               => 'ACME Corp',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'jean@test.fr']);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email'    => 'jean@test.fr',
            'password' => bcrypt('Password123!'),
            'role'     => 'user',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'jean@test.fr',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonPath('user.email', 'jean@test.fr');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'jean@test.fr',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'jean@test.fr',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email'     => 'jean@test.fr',
            'password'  => bcrypt('Password123!'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'jean@test.fr',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user  = User::factory()->create(['is_active' => true]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertStatus(200)
            ->assertJsonPath('email', $user->email);
    }

    public function test_forgot_password_returns_success(): void
    {
        User::factory()->create(['email' => 'jean@test.fr']);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'jean@test.fr',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'jean@test.fr']);
    }

    public function test_forgot_password_does_not_reveal_unknown_email(): void
    {
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'inconnu@test.fr',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);
    }
}
