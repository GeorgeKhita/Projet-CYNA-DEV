<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_list_products(): void
    {
        Product::factory()->count(3)->create(['available' => true]);

        $this->getJson('/api/products')
            ->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_anyone_can_get_single_product(): void
    {
        $product = Product::factory()->create(['available' => true]);

        $this->getJson("/api/products/{$product->id}")
            ->assertStatus(200)
            ->assertJsonPath('id', $product->id);
    }

    public function test_anyone_can_list_categories(): void
    {
        Category::factory()->count(2)->create(['visible' => true]);

        $this->getJson('/api/categories')
            ->assertStatus(200);
    }
}
