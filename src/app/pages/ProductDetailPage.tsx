import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router';
import { Shield, Laptop, Globe, Check, Star } from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Cyna SOC Premium',
    category: 'SOC',
    categoryColor: '#00B4D8',
    icon: Shield,
    description:
      "Solution SOC complète avec surveillance 24/7, détection des menaces en temps réel et analyse comportementale avancée. Notre plateforme utilise l'intelligence artificielle pour identifier les anomalies et répondre automatiquement aux incidents de sécurité.",
    features: [
      'Surveillance continue 24/7 par nos analystes SOC',
      "Détection des menaces basée sur l'IA et le machine learning",
      'Réponse automatisée aux incidents (SOAR)',
      'Rapports de conformité (ISO 27001, RGPD, NIS2)',
    ],
    priceMonthly: 1299,
    priceAnnual: 1079,
    badge: 'Populaire',
  },
  {
    id: 2,
    name: 'Cyna EDR Enterprise',
    category: 'EDR',
    categoryColor: '#8B5CF6',
    icon: Laptop,
    description:
      "Protection endpoint intelligente avec réponse automatisée aux incidents. Détection comportementale avancée basée sur l'IA pour protéger tous vos postes de travail et serveurs contre les menaces les plus sophistiquées.",
    features: [
      "Détection comportementale basée sur l'IA",
      'Isolation automatique des endpoints compromis',
      'Analyse forensique et investigation post-incident',
      'Compatible Windows, macOS, Linux',
    ],
    priceMonthly: 899,
    priceAnnual: 746,
    badge: 'Best-seller',
  },
  {
    id: 3,
    name: 'Cyna XDR Suite',
    category: 'XDR',
    categoryColor: '#10B981',
    icon: Globe,
    description:
      "Plateforme unifiée de détection et réponse étendue multi-vecteurs. Corrélation des événements de sécurité sur l'ensemble de votre infrastructure pour une vision globale et une réponse coordonnée aux incidents.",
    features: [
      'Corrélation des événements multi-sources',
      'Orchestration SOAR intégrée',
      'Intégration native avec +50 outils de sécurité',
      'Dashboard centralisé de threat intelligence',
    ],
    priceMonthly: 1799,
    priceAnnual: 1493,
    badge: 'Premium',
  },
  {
    id: 4,
    name: 'Cyna SOC Essentials',
    category: 'SOC',
    categoryColor: '#00B4D8',
    icon: Shield,
    description:
      "Solution SOC d'entrée de gamme idéale pour les PME souhaitant se protéger efficacement. Monitoring essentiel, alertes en temps réel et support disponible pour démarrer votre programme de sécurité.",
    features: [
      'Surveillance 8h/5j par nos analystes',
      'Détection des menaces en temps réel',
      'Alertes email et SMS instantanées',
      'Rapport mensuel de sécurité',
    ],
    priceMonthly: 699,
    priceAnnual: 580,
    badge: 'Entrée de gamme',
  },
  {
    id: 6,
    name: 'Cyna XDR Enterprise',
    category: 'XDR',
    categoryColor: '#10B981',
    icon: Globe,
    description:
      "Solution XDR de niveau entreprise avec intégration SIEM complète et threat intelligence avancée. Conçue pour les grandes organisations avec des exigences de sécurité élevées.",
    features: [
      'Intégration SIEM bidirectionnelle',
      'Threat intelligence temps réel',
      'Gestion multi-tenant pour MSSP',
      'Conformité SOC 2 Type II, ISO 27001',
    ],
    priceMonthly: 2499,
    priceAnnual: 2074,
    badge: 'Entreprise',
  },
];

export function ProductDetailPage() {
  const { id } = useParams();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  const product = PRODUCTS.find((p) => p.id === Number(id));

  if (!product) {
    return <Navigate to="/catalogue" replace />;
  }

  const similarProducts = [
    ...PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category),
    ...PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 3);

  const currentPrice = selectedPlan === 'monthly' ? product.priceMonthly : product.priceAnnual;
  const Icon = product.icon;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left - Product Visual */}
          <div
            className="relative border border-border rounded-xl p-12 flex items-center justify-center min-h-[500px]"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${product.categoryColor}12, transparent 65%), linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
            }}
          >
            <div className="relative text-center">
              <div
                className="w-48 h-48 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6"
                style={{
                  background: `linear-gradient(135deg, ${product.categoryColor}, ${product.categoryColor}99)`,
                  boxShadow: `0 25px 50px -12px ${product.categoryColor}40`,
                }}
              >
                <Icon className="w-24 h-24 text-foreground" />
              </div>
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${product.categoryColor}20`,
                  color: product.categoryColor,
                  border: `1px solid ${product.categoryColor}40`,
                }}
              >
                {product.category}
              </span>
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
              <span className="px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#8B5CF6]" />
                {product.badge}
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8 text-lg">{product.description}</p>

            <div className="space-y-3 mb-8">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 bg-[#10B981]/20 border border-[#10B981]/40 rounded flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#10B981]" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Plan Selector */}
            <div className="mb-6">
              <label className="block text-foreground font-semibold mb-3">Choisir un plan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlan === 'monthly'
                      ? 'border-[#00B4D8] bg-[#00B4D8]/10'
                      : 'border-border bg-muted/50 hover:border-border'
                  }`}
                >
                  <div className="text-foreground font-semibold">Mensuel</div>
                  <div className="text-sm text-muted-foreground">Facturation mensuelle</div>
                </button>
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                    selectedPlan === 'annual'
                      ? 'border-[#00B4D8] bg-[#00B4D8]/10'
                      : 'border-border bg-muted/50 hover:border-border'
                  }`}
                >
                  <div className="absolute -top-2 -right-2 bg-[#10B981] text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    -17%
                  </div>
                  <div className="text-foreground font-semibold">Annuel</div>
                  <div className="text-sm text-muted-foreground">Économisez 17%</div>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#00B4D8]">
                  {currentPrice.toLocaleString('fr-FR')}€
                </span>
                <span className="text-xl text-muted-foreground">/mois</span>
              </div>
              {selectedPlan === 'annual' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Soit {(product.priceAnnual * 12).toLocaleString('fr-FR')}€ facturés annuellement
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                to="/panier"
                className="flex-1 py-4 bg-[#00B4D8] text-primary-foreground font-semibold rounded-lg text-center hover:bg-[#0096B8] transition-colors"
              >
                Ajouter au panier
              </Link>
              <button className="flex-1 py-4 bg-transparent border-2 border-[#00B4D8] text-[#00B4D8] font-semibold rounded-lg hover:bg-[#00B4D8]/10 transition-colors">
                Essai gratuit 14 jours
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Services similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProducts.map((similar) => {
              const SimilarIcon = similar.icon;
              return (
                <Link
                  key={similar.id}
                  to={`/produit/${similar.id}`}
                  className="bg-gradient-to-br from-card to-card border border-border rounded-xl p-6 hover:border-border transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${similar.categoryColor}15`,
                        border: `1px solid ${similar.categoryColor}30`,
                      }}
                    >
                      <SimilarIcon className="w-5 h-5" style={{ color: similar.categoryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-[#00B4D8] transition-colors truncate">
                        {similar.name}
                      </h3>
                      <span className="text-xs font-semibold" style={{ color: similar.categoryColor }}>
                        {similar.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#00B4D8]">
                    {similar.priceMonthly.toLocaleString('fr-FR')}€
                    <span className="text-sm text-muted-foreground">/mois</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
