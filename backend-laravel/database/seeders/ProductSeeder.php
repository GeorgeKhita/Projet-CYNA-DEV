<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name'          => 'Cyna SOC Premium',
                'description'   => 'Notre offre SOC haut de gamme avec surveillance 24/7, analyse des menaces avancées et réponse aux incidents en temps réel par une équipe d\'experts certifiés.',
                'category'      => 'SOC',
                'price_monthly' => 1299.00,
                'price_annual'  => 1079.00,
                'available'     => true,
                'popular'       => true,
                'order'         => 1,
            ],
            [
                'name'          => 'Cyna EDR Enterprise',
                'description'   => 'Solution EDR entreprise avec détection comportementale alimentée par IA, isolation automatique des endpoints compromis et forensique avancée.',
                'category'      => 'EDR',
                'price_monthly' => 899.00,
                'price_annual'  => 746.00,
                'available'     => true,
                'popular'       => true,
                'order'         => 2,
            ],
            [
                'name'          => 'Cyna XDR Suite',
                'description'   => 'Plateforme XDR unifiée qui corrèle les données de tous vos outils de sécurité pour une visibilité complète et une réponse coordonnée aux menaces.',
                'category'      => 'XDR',
                'price_monthly' => 1799.00,
                'price_annual'  => 1493.00,
                'available'     => true,
                'popular'       => true,
                'order'         => 3,
            ],
            [
                'name'          => 'Cyna SOC Essentials',
                'description'   => 'Offre SOC accessible pour les PME avec surveillance en heures ouvrées, alertes en temps réel et rapports mensuels de sécurité.',
                'category'      => 'SOC',
                'price_monthly' => 699.00,
                'price_annual'  => 580.00,
                'available'     => true,
                'popular'       => false,
                'order'         => 4,
            ],
            [
                'name'          => 'Cyna EDR Pro',
                'description'   => 'EDR professionnel avec protection des endpoints, gestion des vulnérabilités et intégration SIEM pour les équipes sécurité intermédiaires.',
                'category'      => 'EDR',
                'price_monthly' => 1199.00,
                'price_annual'  => 995.00,
                'available'     => false,
                'popular'       => false,
                'order'         => 5,
            ],
            [
                'name'          => 'Cyna XDR Enterprise',
                'description'   => 'Suite XDR de niveau entreprise avec threat hunting proactif, SOAR intégré, SLA premium et équipe dédiée pour les grandes organisations.',
                'category'      => 'XDR',
                'price_monthly' => 2499.00,
                'price_annual'  => 2074.00,
                'available'     => true,
                'popular'       => false,
                'order'         => 6,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['name' => $product['name']], $product);
        }
    }
}
