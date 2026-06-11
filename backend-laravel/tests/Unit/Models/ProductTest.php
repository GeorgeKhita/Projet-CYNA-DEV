<?php

namespace Tests\Unit\Models;

use App\Models\Product;
use Tests\TestCase;

class ProductTest extends TestCase
{
    // ── Casts JSON ────────────────────────────────────────────────────────

    public function test_features_casts_json_to_array(): void
    {
        $product = new Product(['features' => ['SOC', 'EDR', 'XDR']]);
        $this->assertIsArray($product->features);
        $this->assertCount(3, $product->features);
    }

    public function test_images_casts_json_to_array(): void
    {
        $product = new Product(['images' => ['img1.png', 'img2.png']]);
        $this->assertIsArray($product->images);
        $this->assertCount(2, $product->images);
    }

    public function test_features_null_when_not_set(): void
    {
        $product = new Product(['features' => null]);
        $this->assertNull($product->features);
    }

    public function test_images_null_when_not_set(): void
    {
        $product = new Product(['images' => null]);
        $this->assertNull($product->images);
    }

    public function test_features_preserves_values(): void
    {
        $features = ['Surveillance 24/7', 'Alertes temps réel', 'Conformité NIS2'];
        $product  = new Product(['features' => $features]);
        $this->assertSame($features, $product->features);
    }

    // ── Casts décimaux ────────────────────────────────────────────────────

    public function test_price_monthly_is_in_fillable(): void
    {
        $this->assertContains('price_monthly', (new Product())->getFillable());
    }

    public function test_price_annual_is_in_fillable(): void
    {
        $this->assertContains('price_annual', (new Product())->getFillable());
    }

    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new Product())->getFillable();

        foreach (['category_id', 'name', 'slug', 'description', 'status', 'priority'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_status_can_be_set(): void
    {
        $available   = new Product(['status' => 'available']);
        $unavailable = new Product(['status' => 'unavailable']);

        $this->assertSame('available', $available->status);
        $this->assertSame('unavailable', $unavailable->status);
    }

    public function test_name_is_stored_as_string(): void
    {
        $product = new Product(['name' => 'CYNA SOC Premium']);
        $this->assertIsString($product->name);
        $this->assertSame('CYNA SOC Premium', $product->name);
    }

    public function test_priority_can_be_set(): void
    {
        $product = new Product(['priority' => 5]);
        $this->assertSame(5, $product->priority);
    }
}
