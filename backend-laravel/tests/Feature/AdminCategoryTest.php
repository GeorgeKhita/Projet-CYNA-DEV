<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryTest extends TestCase
{
    use RefreshDatabase;

    private function adminAuth(): static
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        return $this->withHeader('Authorization', 'Bearer ' . $admin->createToken('t')->plainTextToken);
    }

    public function test_admin_can_create_category(): void
    {
        $this->adminAuth()->postJson('/api/admin/categories', [
            'name'  => 'NDR',
            'color' => '#FF0000',
        ])->assertStatus(201)
          ->assertJsonPath('name', 'NDR');

        $this->assertDatabaseHas('categories', ['name' => 'NDR']);
        // L'action est journalisée (table activity_logs)
        $this->assertDatabaseHas('activity_logs', ['action' => 'category_created']);
    }

    public function test_create_category_requires_name_and_color(): void
    {
        $this->adminAuth()->postJson('/api/admin/categories', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'color']);
    }

    public function test_admin_can_update_category(): void
    {
        $category = Category::factory()->create();

        $this->adminAuth()->putJson("/api/admin/categories/{$category->id}", ['color' => '#123456'])
            ->assertStatus(200);

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'color' => '#123456']);
    }

    public function test_cannot_delete_category_with_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id]);

        $this->adminAuth()->deleteJson("/api/admin/categories/{$category->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_admin_can_delete_empty_category(): void
    {
        $category = Category::factory()->create();

        $this->adminAuth()->deleteJson("/api/admin/categories/{$category->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_non_admin_cannot_create_category(): void
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);

        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('t')->plainTextToken)
            ->postJson('/api/admin/categories', ['name' => 'X', 'color' => '#000'])
            ->assertStatus(403);
    }
}
