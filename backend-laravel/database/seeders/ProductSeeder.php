<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $soc = Category::where('name', 'SOC')->first();
        $edr = Category::where('name', 'EDR')->first();
        $xdr = Category::where('name', 'XDR')->first();

        $products = [
            [
                'category_id'    => $soc->id,
                'name'           => 'Cyna SOC Premium',
                'name_en'        => 'Cyna SOC Premium',
                'slug'           => 'cyna-soc-premium',
                'description'    => 'Solution SOC complète avec surveillance 24/7, détection des menaces par IA et réponse automatisée aux incidents.',
                'description_en' => 'Complete SOC solution with 24/7 monitoring, AI-powered threat detection and automated incident response.',
                'features'       => ['Surveillance 24/7 par nos analystes SOC', 'Détection par IA et machine learning', 'Réponse automatisée aux incidents (SOAR)', 'Conformité ISO 27001, RGPD, NIS2'],
                'features_en'    => ['24/7 monitoring by our SOC analysts', 'AI and machine learning detection', 'Automated incident response (SOAR)', 'ISO 27001, GDPR, NIS2 compliance'],
                'price_monthly'  => 1299.00,
                'price_annual'   => 1169.10,
                'status'         => 'available',
                'priority'       => 1,
                'max_capacity'   => 10,
            ],
            [
                'category_id'    => $soc->id,
                'name'           => 'Cyna SOC Essentials',
                'name_en'        => 'Cyna SOC Essentials',
                'slug'           => 'cyna-soc-essentials',
                'description'    => 'Solution SOC d\'entrée de gamme idéale pour les PME souhaitant se protéger efficacement sans mobiliser des ressources internes.',
                'description_en' => 'Entry-level SOC solution ideal for SMEs looking to protect themselves effectively without mobilising internal resources.',
                'features'       => ['Surveillance 8h/5j par nos analystes', 'Détection des menaces en temps réel', 'Alertes email et SMS instantanées', 'Rapport mensuel de sécurité', 'Analyste dédié'],
                'features_en'    => ['8h/5d monitoring by our analysts', 'Real-time threat detection', 'Instant email and SMS alerts', 'Monthly security report', 'Dedicated analyst'],
                'price_monthly'  => 699.00,
                'price_annual'   => 629.10,
                'status'         => 'available',
                'priority'       => 2,
                'max_capacity'   => 10,
            ],
            [
                'category_id'    => $edr->id,
                'name'           => 'Cyna EDR Enterprise',
                'name_en'        => 'Cyna EDR Enterprise',
                'slug'           => 'cyna-edr-enterprise',
                'description'    => 'Protection endpoint intelligente avec détection comportementale par IA, isolation automatique et analyse forensique avancée.',
                'description_en' => 'Intelligent endpoint protection with AI behavioural detection, automatic isolation and advanced forensic analysis.',
                'features'       => ['Détection comportementale par IA', 'Isolation automatique des endpoints compromis', 'Analyse forensique post-incident', 'Compatible Windows, macOS, Linux', 'Intégration SIEM native'],
                'features_en'    => ['AI behavioural detection', 'Automatic isolation of compromised endpoints', 'Post-incident forensic analysis', 'Windows, macOS, Linux compatible', 'Native SIEM integration'],
                'price_monthly'  => 899.00,
                'price_annual'   => 809.10,
                'status'         => 'available',
                'priority'       => 3,
                'max_capacity'   => 10,
            ],
            [
                'category_id'    => $edr->id,
                'name'           => 'Cyna EDR Pro',
                'name_en'        => 'Cyna EDR Pro',
                'slug'           => 'cyna-edr-pro',
                'description'    => 'Protection EDR avancée avec machine learning, threat hunting actif et intégration SIEM pour les équipes sécurité intermédiaires.',
                'description_en' => 'Advanced EDR protection with machine learning, active threat hunting and SIEM integration for intermediate security teams.',
                'features'       => ['Machine learning avancé', 'Threat hunting proactif', 'Analyse comportementale étendue', 'Intégration SIEM native', 'Threat intelligence'],
                'features_en'    => ['Advanced machine learning', 'Proactive threat hunting', 'Extended behavioural analysis', 'Native SIEM integration', 'Threat intelligence'],
                'price_monthly'  => 1199.00,
                'price_annual'   => 1079.10,
                'status'         => 'available',
                'priority'       => 4,
                'max_capacity'   => 10,
            ],
            [
                'category_id'    => $xdr->id,
                'name'           => 'Cyna XDR Suite',
                'name_en'        => 'Cyna XDR Suite',
                'slug'           => 'cyna-xdr-suite',
                'description'    => 'Plateforme unifiée de détection et réponse étendue multi-vecteurs avec corrélation de données sur l\'ensemble de votre infrastructure.',
                'description_en' => 'Unified multi-vector extended detection and response platform with data correlation across your entire infrastructure.',
                'features'       => ['Corrélation des événements multi-sources', 'Orchestration SOAR intégrée', '+50 connecteurs natifs', 'Dashboard centralisé threat intelligence'],
                'features_en'    => ['Multi-source event correlation', 'Integrated SOAR orchestration', '50+ native connectors', 'Centralised threat intelligence dashboard'],
                'price_monthly'  => 1799.00,
                'price_annual'   => 1619.10,
                'status'         => 'available',
                'priority'       => 5,
                'max_capacity'   => 10,
            ],
            [
                'category_id'    => $xdr->id,
                'name'           => 'Cyna XDR Enterprise',
                'name_en'        => 'Cyna XDR Enterprise',
                'slug'           => 'cyna-xdr-enterprise',
                'description'    => 'Solution XDR de niveau entreprise avec intégration SIEM complète, threat hunting proactif et gestion multi-tenant MSSP.',
                'description_en' => 'Enterprise-grade XDR solution with full SIEM integration, proactive threat hunting and MSSP multi-tenant management.',
                'features'       => ['Intégration SIEM bidirectionnelle', 'Threat intelligence temps réel', 'Gestion multi-tenant MSSP', 'Conformité SOC 2 Type II, ISO 27001'],
                'features_en'    => ['Bidirectional SIEM integration', 'Real-time threat intelligence', 'MSSP multi-tenant management', 'SOC 2 Type II, ISO 27001 compliance'],
                'price_monthly'  => 2499.00,
                'price_annual'   => 2249.10,
                'status'         => 'available',
                'priority'       => 6,
                'max_capacity'   => 10,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['slug' => $product['slug']], $product);
        }
    }
}
