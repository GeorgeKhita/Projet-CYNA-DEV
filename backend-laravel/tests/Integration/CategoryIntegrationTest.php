<?php

namespace Tests\Integration;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_is_persisted_to_database(): void
    {
        $category = Category::factory()->create(['name' => 'SOC']);

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'SOC']);
    }

    public function test_category_has_many_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $category->id]);

        $this->assertCount(3, $category->fresh()->products);
    }

    public function test_deleting_category_cascades_to_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(2)->create(['category_id' => $category->id]);

        $category->delete();

        $this->assertDatabaseCount('products', 0);
    }

    public function test_product_belongs_to_category(): void
    {
        $category = Category::factory()->create(['name' => 'EDR']);
        $product  = Product::factory()->create(['category_id' => $category->id]);

        $this->assertSame('EDR', $product->category->name);
    }
}
