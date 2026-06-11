<?php

namespace Tests\Unit\Models;

use App\Models\CarouselSlide;
use Tests\TestCase;

class CarouselSlideTest extends TestCase
{
    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new CarouselSlide())->getFillable();

        foreach (['title', 'subtitle', 'image_url', 'cta_text', 'link', 'display_order', 'product_id'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_title_can_be_set(): void
    {
        $slide = new CarouselSlide(['title' => 'Bienvenue sur CYNA']);
        $this->assertSame('Bienvenue sur CYNA', $slide->title);
    }

    public function test_display_order_can_be_set(): void
    {
        $slide = new CarouselSlide(['display_order' => 3]);
        $this->assertSame(3, $slide->display_order);
    }

    public function test_link_can_be_set(): void
    {
        $slide = new CarouselSlide(['link' => '/catalogue']);
        $this->assertSame('/catalogue', $slide->link);
    }

    public function test_subtitle_can_be_set(): void
    {
        $slide = new CarouselSlide(['subtitle' => 'Votre sécurité, notre priorité']);
        $this->assertSame('Votre sécurité, notre priorité', $slide->subtitle);
    }

    public function test_cta_text_can_be_set(): void
    {
        $slide = new CarouselSlide(['cta_text' => 'Découvrir']);
        $this->assertSame('Découvrir', $slide->cta_text);
    }

    public function test_image_url_can_be_set(): void
    {
        $slide = new CarouselSlide(['image_url' => 'https://cdn.cyna.fr/banner.jpg']);
        $this->assertSame('https://cdn.cyna.fr/banner.jpg', $slide->image_url);
    }
}
