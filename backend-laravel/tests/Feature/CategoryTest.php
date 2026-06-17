<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_endpoint_is_public(): void
    {
        Category::factory()->create();

        $this->getJson('/api/categories')->assertStatus(200);
    }

    public function test_categories_are_returned_with_expected_fields(): void
    {
        Category::factory()->create(['name' => 'SOC']);

        $this->getJson('/api/categories')
            ->assertStatus(200)
            ->assertJsonStructure([['id', 'name', 'description', 'color', 'display_order', 'products_count']]);
    }

    public function test_products_count_only_includes_available_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(2)->create(['category_id' => $category->id, 'status' => 'available']);
        Product::factory()->create(['category_id' => $category->id, 'status' => 'unavailable']);

        $response = $this->getJson('/api/categories')->assertStatus(200);
        $cat = collect($response->json())->firstWhere('id', $category->id);

        $this->assertSame(2, $cat['products_count']);
    }
}
