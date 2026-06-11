<?php

namespace Tests\Unit\Models;

use App\Models\CarouselSlide;
use Tests\TestCase;

class CarouselSlideTest extends TestCase
{
    // ── Cast booléen ──────────────────────────────────────────────────────

    public function test_active_casts_to_boolean_true(): void
    {
        $slide = new CarouselSlide(['active' => 1]);
        $this->assertIsBool($slide->active);
        $this->assertTrue($slide->active);
    }

    public function test_active_casts_to_boolean_false(): void
    {
        $slide = new CarouselSlide(['active' => 0]);
        $this->assertIsBool($slide->active);
        $this->assertFalse($slide->active);
    }

    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new CarouselSlide())->getFillable();

        foreach (['title', 'subtitle', 'image_url', 'cta_text', 'cta_url', 'position', 'active'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_title_can_be_set(): void
    {
        $slide = new CarouselSlide(['title' => 'Bienvenue sur CYNA']);
        $this->assertSame('Bienvenue sur CYNA', $slide->title);
    }

    public function test_position_can_be_set(): void
    {
        $slide = new CarouselSlide(['position' => 3]);
        $this->assertSame(3, $slide->position);
    }

    public function test_cta_url_can_be_set(): void
    {
        $slide = new CarouselSlide(['cta_url' => '/catalogue']);
        $this->assertSame('/catalogue', $slide->cta_url);
    }
}
