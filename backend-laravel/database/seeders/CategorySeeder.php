<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'SOC',
                'description' => 'Security Operations Center — Surveillance et réponse aux incidents 24/7 par des experts certifiés.',
                'color'       => '#00B4D8',
                'visible'     => true,
            ],
            [
                'name'        => 'EDR',
                'description' => 'Endpoint Detection & Response — Protection avancée de tous vos endpoints avec détection comportementale par IA.',
                'color'       => '#8B5CF6',
                'visible'     => true,
            ],
            [
                'name'        => 'XDR',
                'description' => 'Extended Detection & Response — Visibilité unifiée et corrélation de données sur l\'ensemble de votre infrastructure.',
                'color'       => '#10B981',
                'visible'     => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['name' => $category['name']], $category);
        }
    }
}
