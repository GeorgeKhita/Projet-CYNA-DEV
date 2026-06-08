<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Catégories ────────────────────────────────────────────────────
        $cats = [
            ['name' => 'SOC', 'description' => 'Security Operations Center — Surveillance et détection en temps réel', 'color' => '#00B4D8', 'display_order' => 1],
            ['name' => 'EDR', 'description' => 'Endpoint Detection & Response — Protection avancée des endpoints', 'color' => '#8B5CF6', 'display_order' => 2],
            ['name' => 'XDR', 'description' => 'Extended Detection & Response — Vision unifiée sur toute l\'infrastructure', 'color' => '#10B981', 'display_order' => 3],
        ];

        foreach ($cats as $cat) {
            DB::table('categories')->updateOrInsert(
                ['name' => $cat['name']],
                array_merge($cat, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        $socId = DB::table('categories')->where('name', 'SOC')->value('id');
        $edrId = DB::table('categories')->where('name', 'EDR')->value('id');
        $xdrId = DB::table('categories')->where('name', 'XDR')->value('id');

        // ── Produits ──────────────────────────────────────────────────────
        $products = [
            [
                'category_id' => $socId, 'name' => 'Cyna SOC Premium', 'slug' => 'cyna-soc-premium',
                'description' => 'Solution SOC complète avec surveillance 24/7, détection des menaces par IA et réponse automatisée aux incidents.',
                'features'    => json_encode(['Surveillance 24/7 par nos analystes SOC', 'Détection par IA et machine learning', 'Réponse automatisée aux incidents (SOAR)', 'Conformité ISO 27001, RGPD, NIS2']),
                'price_monthly' => 1299.00, 'price_annual' => 1079.00, 'status' => 'available', 'priority' => 1,
            ],
            [
                'category_id' => $socId, 'name' => 'Cyna SOC Essentials', 'slug' => 'cyna-soc-essentials',
                'description' => 'Solution SOC d\'entrée de gamme idéale pour les PME souhaitant se protéger efficacement.',
                'features'    => json_encode(['Surveillance 8h/5j par nos analystes', 'Détection des menaces en temps réel', 'Alertes email et SMS instantanées', 'Rapport mensuel de sécurité']),
                'price_monthly' => 699.00, 'price_annual' => 580.00, 'status' => 'available', 'priority' => 2,
            ],
            [
                'category_id' => $edrId, 'name' => 'Cyna EDR Enterprise', 'slug' => 'cyna-edr-enterprise',
                'description' => 'Protection endpoint intelligente avec détection comportementale par IA et réponse automatisée.',
                'features'    => json_encode(['Détection comportementale par IA', 'Isolation automatique des endpoints compromis', 'Analyse forensique post-incident', 'Compatible Windows, macOS, Linux']),
                'price_monthly' => 899.00, 'price_annual' => 746.00, 'status' => 'available', 'priority' => 3,
            ],
            [
                'category_id' => $edrId, 'name' => 'Cyna EDR Pro', 'slug' => 'cyna-edr-pro',
                'description' => 'Protection EDR avancée avec machine learning et threat hunting actif.',
                'features'    => json_encode(['Machine learning avancé', 'Threat hunting proactif', 'Analyse comportementale étendue', 'Intégration SIEM native']),
                'price_monthly' => 1199.00, 'price_annual' => 995.00, 'status' => 'available', 'priority' => 4,
            ],
            [
                'category_id' => $xdrId, 'name' => 'Cyna XDR Suite', 'slug' => 'cyna-xdr-suite',
                'description' => 'Plateforme unifiée de détection et réponse étendue multi-vecteurs.',
                'features'    => json_encode(['Corrélation des événements multi-sources', 'Orchestration SOAR intégrée', '+50 connecteurs natifs', 'Dashboard centralisé threat intelligence']),
                'price_monthly' => 1799.00, 'price_annual' => 1493.00, 'status' => 'available', 'priority' => 5,
            ],
            [
                'category_id' => $xdrId, 'name' => 'Cyna XDR Enterprise', 'slug' => 'cyna-xdr-enterprise',
                'description' => 'Solution XDR de niveau entreprise avec intégration SIEM complète.',
                'features'    => json_encode(['Intégration SIEM bidirectionnelle', 'Threat intelligence temps réel', 'Gestion multi-tenant MSSP', 'Conformité SOC 2 Type II, ISO 27001']),
                'price_monthly' => 2499.00, 'price_annual' => 2074.00, 'status' => 'available', 'priority' => 6,
            ],
        ];

        foreach ($products as $product) {
            DB::table('products')->updateOrInsert(
                ['slug' => $product['slug']],
                array_merge($product, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // ── Utilisateur admin de test ─────────────────────────────────────
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@cyna-it.fr'],
            [
                'first_name'        => 'Admin',
                'last_name'         => 'CYNA',
                'email'             => 'admin@cyna-it.fr',
                'password'          => Hash::make('Admin1234!'),
                'company'           => 'CYNA',
                'role'              => 'admin',
                'is_email_verified' => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]
        );

        $this->command->info('✓ Catégories, produits et admin insérés.');
    }
}
