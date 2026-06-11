<?php

namespace Tests\Integration;

use App\Models\CarouselSlide;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarouselSlideIntegrationTest extends TestCase
{
    use RefreshDatabase;

    // ── Persistance ───────────────────────────────────────────────────────

    public function test_slide_is_persisted_to_database(): void
    {
        CarouselSlide::factory()->create([
            'title' => 'Protection XDR Enterprise',
            'link'  => '/produits/xdr',
        ]);

        $this->assertDatabaseHas('homepage_carousel', [
            'title' => 'Protection XDR Enterprise',
            'link'  => '/produits/xdr',
        ]);
    }

    public function test_slide_can_be_retrieved_by_id(): void
    {
        $slide = CarouselSlide::factory()->create(['title' => 'CYNA SOC']);

        $found = CarouselSlide::find($slide->id);
        $this->assertNotNull($found);
        $this->assertSame('CYNA SOC', $found->title);
    }

    // ── Relation product ──────────────────────────────────────────────────

    public function test_slide_can_belong_to_product(): void
    {
        $product = Product::factory()->create(['name' => 'CYNA EDR Pro']);
        $slide   = CarouselSlide::factory()->create(['product_id' => $product->id]);

        $this->assertSame('CYNA EDR Pro', $slide->product->name);
    }

    public function test_slide_product_is_nullable(): void
    {
        $slide = CarouselSlide::factory()->create(['product_id' => null]);

        $this->assertNull($slide->product_id);
        $this->assertNull($slide->product);
    }

    public function test_deleting_product_sets_slide_product_id_to_null(): void
    {
        $product = Product::factory()->create();
        $slide   = CarouselSlide::factory()->create(['product_id' => $product->id]);

        $product->delete();

        $fresh = CarouselSlide::find($slide->id);
        $this->assertNull($fresh->product_id);
    }

    // ── Ordre d'affichage ─────────────────────────────────────────────────

    public function test_slides_can_be_ordered_by_display_order(): void
    {
        CarouselSlide::factory()->create(['display_order' => 3]);
        CarouselSlide::factory()->create(['display_order' => 1]);
        CarouselSlide::factory()->create(['display_order' => 2]);

        $slides = CarouselSlide::orderBy('display_order')->get();

        $this->assertSame(1, $slides->first()->display_order);
        $this->assertSame(3, $slides->last()->display_order);
    }

    // ── Champs ────────────────────────────────────────────────────────────

    public function test_slide_fields_are_stored_correctly(): void
    {
        $slide = CarouselSlide::factory()->create([
            'title'         => 'Titre test',
            'subtitle'      => 'Sous-titre test',
            'cta_text'      => 'Essayer',
            'link'          => '/offres/soc',
            'display_order' => 5,
        ]);

        $fresh = CarouselSlide::find($slide->id);
        $this->assertSame('Titre test', $fresh->title);
        $this->assertSame('Sous-titre test', $fresh->subtitle);
        $this->assertSame('Essayer', $fresh->cta_text);
        $this->assertSame('/offres/soc', $fresh->link);
        $this->assertSame(5, $fresh->display_order);
    }
}
