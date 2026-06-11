<?php

namespace Tests\Integration;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductIntegrationTest extends TestCase
{
    use RefreshDatabase;

    // ── Persistance ───────────────────────────────────────────────────────

    public function test_product_is_persisted_to_database(): void
    {
        $product = Product::factory()->create(['name' => 'CYNA SOC Premium']);

        $this->assertDatabaseHas('products', ['name' => 'CYNA SOC Premium']);
    }

    public function test_product_slug_is_unique(): void
    {
        $p1 = Product::factory()->create(['slug' => 'cyna-soc-1']);
        $p2 = Product::factory()->create(['slug' => 'cyna-soc-2']);

        $this->assertNotSame($p1->slug, $p2->slug);
    }

    // ── Features JSON ─────────────────────────────────────────────────────

    public function test_features_are_stored_as_json_and_retrieved_as_array(): void
    {
        $features = ['Surveillance 24/7', 'Alertes temps réel', 'Conformité NIS2'];
        $product  = Product::factory()->create(['features' => $features]);

        $fresh = Product::find($product->id);

        $this->assertIsArray($fresh->features);
        $this->assertCount(3, $fresh->features);
        $this->assertContains('Surveillance 24/7', $fresh->features);
    }

    public function test_images_are_stored_as_json_and_retrieved_as_array(): void
    {
        $images  = ['img1.png', 'img2.png'];
        $product = Product::factory()->create(['images' => $images]);

        $fresh = Product::find($product->id);

        $this->assertIsArray($fresh->images);
        $this->assertCount(2, $fresh->images);
    }

    // ── Relation category ─────────────────────────────────────────────────

    public function test_product_belongs_to_category(): void
    {
        $category = Category::factory()->create(['name' => 'SOC']);
        $product  = Product::factory()->create(['category_id' => $category->id]);

        $this->assertSame('SOC', $product->category->name);
    }

    public function test_category_has_many_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $category->id]);

        $this->assertCount(3, $category->products);
    }

    public function test_deleting_category_cascades_to_products(): void
    {
        $category = Category::factory()->create();
        $product  = Product::factory()->create(['category_id' => $category->id]);

        $category->delete();

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    // ── Relation subscriptions ────────────────────────────────────────────

    public function test_product_has_many_subscriptions(): void
    {
        $user    = User::factory()->create();
        $product = Product::factory()->create();
        $order   = Order::factory()->create(['user_id' => $user->id]);

        Subscription::factory()->count(2)->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => $order->id,
        ]);

        $this->assertCount(2, $product->subscriptions);
    }

    // ── Statuts ───────────────────────────────────────────────────────────

    public function test_product_status_can_be_toggled(): void
    {
        $product = Product::factory()->create(['status' => 'available']);

        $product->update(['status' => 'unavailable']);

        $this->assertDatabaseHas('products', [
            'id'     => $product->id,
            'status' => 'unavailable',
        ]);
    }

    // ── Prix ──────────────────────────────────────────────────────────────

    public function test_product_prices_are_stored_correctly(): void
    {
        $product = Product::factory()->create([
            'price_monthly' => 299.99,
            'price_annual'  => 2999.99,
        ]);

        $fresh = Product::find($product->id);
        $this->assertEquals(299.99, $fresh->price_monthly);
        $this->assertEquals(2999.99, $fresh->price_annual);
    }
}
