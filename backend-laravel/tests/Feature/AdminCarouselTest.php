<?php

namespace Tests\Feature;

use App\Models\CarouselSlide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCarouselTest extends TestCase
{
    use RefreshDatabase;

    private function adminAuth(): static
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        return $this->withHeader('Authorization', 'Bearer ' . $admin->createToken('t')->plainTextToken);
    }

    public function test_admin_can_list_slides(): void
    {
        CarouselSlide::factory()->create();
        $this->adminAuth()->getJson('/api/admin/carousel')->assertStatus(200);
    }

    public function test_admin_can_create_slide(): void
    {
        $this->adminAuth()->postJson('/api/admin/carousel', [
            'title'    => 'Promo rentrée',
            'subtitle' => 'Jusqu\'à -20%',
            'active'   => true,
        ])->assertStatus(201)
          ->assertJsonPath('title', 'Promo rentrée');

        $this->assertDatabaseHas('homepage_carousel', ['title' => 'Promo rentrée']);
    }

    public function test_create_slide_requires_title(): void
    {
        $this->adminAuth()->postJson('/api/admin/carousel', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_non_admin_cannot_create_slide(): void
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);

        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('t')->plainTextToken)
            ->postJson('/api/admin/carousel', ['title' => 'X'])
            ->assertStatus(403);
    }
}
