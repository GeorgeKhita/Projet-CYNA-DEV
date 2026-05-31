<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        return $admin->createToken('test')->plainTextToken;
    }

    private function userToken(): string
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);
        return $user->createToken('test')->plainTextToken;
    }

    public function test_admin_can_access_dashboard(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
            ->getJson('/api/admin/dashboard')
            ->assertStatus(200);
    }

    public function test_non_admin_cannot_access_dashboard(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->userToken())
            ->getJson('/api/admin/dashboard')
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_admin(): void
    {
        $this->getJson('/api/admin/dashboard')
            ->assertStatus(401);
    }

    public function test_admin_can_list_users(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
            ->getJson('/api/admin/users')
            ->assertStatus(200);
    }

    public function test_admin_can_list_products(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
            ->getJson('/api/admin/products')
            ->assertStatus(200);
    }

    public function test_admin_can_list_orders(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
            ->getJson('/api/admin/orders')
            ->assertStatus(200);
    }

    public function test_admin_can_send_2fa(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $token = $admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/admin/send-2fa')
            ->assertStatus(200)
            ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
        // Vérifier que two_factor_code a été renseigné
        $admin->refresh();
        $this->assertNotNull($admin->two_factor_code);
        $this->assertNotNull($admin->two_factor_expires_at);
    }
}
