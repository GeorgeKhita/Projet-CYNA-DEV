<?php

namespace Database\Seeders;

use App\Models\CarouselSlide;
use Illuminate\Database\Seeder;

class CarouselSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'title'     => 'Protégez votre entreprise avec CYNA SOC',
                'subtitle'  => 'Surveillance 24/7, détection des menaces en temps réel et réponse aux incidents pour les entreprises B2B.',
                'image_url' => null,
                'cta_text'  => 'Découvrir le SOC',
                'cta_url'   => '/catalogue',
                'position'  => 1,
                'active'    => true,
            ],
            [
                'title'     => 'EDR nouvelle génération',
                'subtitle'  => 'Protection avancée des endpoints avec intelligence artificielle et machine learning.',
                'image_url' => null,
                'cta_text'  => 'En savoir plus',
                'cta_url'   => '/catalogue',
                'position'  => 2,
                'active'    => true,
            ],
            [
                'title'     => 'XDR Suite Enterprise — Vision unifiée',
                'subtitle'  => 'Corrélation multi-vecteurs, orchestration SOAR et visibilité complète de votre infrastructure.',
                'image_url' => null,
                'cta_text'  => 'Voir la Suite XDR',
                'cta_url'   => '/catalogue',
                'position'  => 3,
                'active'    => true,
            ],
        ];

        foreach ($slides as $slide) {
            CarouselSlide::firstOrCreate(['title' => $slide['title']], $slide);
        }
    }
}
