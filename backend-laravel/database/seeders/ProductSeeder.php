<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $translations = [
            'Cyna SOC Premium' => [
                'name_en'        => 'Cyna SOC Premium',
                'description_en' => 'Our premium SOC offering with 24/7 monitoring, advanced threat analysis, and real-time incident response by a team of certified experts.',
                'features_en'    => [
                    '24/7 monitoring by our analysts',
                    'Advanced threat detection and analysis',
                    'Real-time incident response',
                    'Monthly executive security reports',
                    'Dedicated expert team',
                ],
            ],
            'Cyna EDR Enterprise' => [
                'name_en'        => 'Cyna EDR Enterprise',
                'description_en' => 'Enterprise EDR solution with AI-powered behavioral detection, automatic isolation of compromised endpoints, and advanced forensics capabilities.',
                'features_en'    => [
                    'AI-powered behavioral detection',
                    'Automatic endpoint isolation',
                    'Advanced forensics',
                    'Threat hunting',
                    'SIEM integration',
                ],
            ],
            'Cyna XDR Suite' => [
                'name_en'        => 'Cyna XDR Suite',
                'description_en' => 'Unified XDR platform that correlates data from all your security tools for complete visibility and a coordinated threat response.',
                'features_en'    => [
                    'Unified data correlation',
                    'Cross-platform threat detection',
                    'Automated response playbooks',
                    'Real-time dashboards',
                    'Third-party tool integration',
                ],
            ],
            'Cyna SOC Essentials' => [
                'name_en'        => 'Cyna SOC Essentials',
                'description_en' => 'Accessible SOC solution for SMEs with business hours monitoring, real-time alerts, and monthly security reports.',
                'features_en'    => [
                    '8h/5d monitoring by our analysts',
                    'Real-time threat detection',
                    'Instant email and SMS alerts',
                    'Monthly security report',
                    'Dedicated analyst',
                ],
            ],
            'Cyna EDR Pro' => [
                'name_en'        => 'Cyna EDR Pro',
                'description_en' => 'Professional EDR with endpoint protection, vulnerability management, and SIEM integration for intermediate security teams.',
                'features_en'    => [
                    'Endpoint protection',
                    'Vulnerability management',
                    'SIEM integration',
                    'Behavioral analysis',
                    'Threat intelligence',
                ],
            ],
            'Cyna XDR Enterprise' => [
                'name_en'        => 'Cyna XDR Enterprise',
                'description_en' => 'Enterprise-grade XDR suite with proactive threat hunting, integrated SOAR, premium SLA, and a dedicated team for large organizations.',
                'features_en'    => [
                    'Proactive threat hunting',
                    'Integrated SOAR',
                    'Premium SLA',
                    'Dedicated security team',
                    'Custom reporting',
                    'Compliance support',
                ],
            ],
        ];

        foreach ($translations as $name => $trans) {
            $product = Product::where('name', $name)->first();
            if ($product) {
                $product->name_en        = $trans['name_en'];
                $product->description_en = $trans['description_en'];
                $product->features_en    = $trans['features_en'];
                $product->save();
            }
        }
    }
}
