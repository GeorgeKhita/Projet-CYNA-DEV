<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new Category())->getFillable();

        foreach (['name', 'description', 'color', 'image', 'display_order'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_name_can_be_set(): void
    {
        $category = new Category(['name' => 'SOC']);
        $this->assertSame('SOC', $category->name);
    }

    public function test_color_can_be_set(): void
    {
        $category = new Category(['color' => '#00B4D8']);
        $this->assertSame('#00B4D8', $category->color);
    }

    public function test_display_order_can_be_set(): void
    {
        $category = new Category(['display_order' => 2]);
        $this->assertSame(2, $category->display_order);
    }

    public function test_description_can_be_null(): void
    {
        $category = new Category(['description' => null]);
        $this->assertNull($category->description);
    }
}
