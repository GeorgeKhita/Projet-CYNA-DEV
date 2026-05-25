import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Shield, Laptop, Globe, ArrowRight, Star, Zap, Clock, Users, CheckCircle } from 'lucide-react';
import { getProducts, type Product } from '../api/products';

const CATEGORY_COLORS: Record<string, string> = {
  SOC: '#00B4D8',
  EDR: '#8B5CF6',
  XDR: '#10B981',
};
const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat?.toUpperCase()] ?? '#00B4D8';

export function HomePage() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts()
      .then((all) => {
        const popular = all.filter((p) => p.popular && p.available).slice(0, 3);
        const others  = all.filter((p) => p.available && !popular.find((x) => x.id === p.id));
        setTopProducts([...popular, ...others].slice(0, 3));
      })
      .catch(() => {/* use empty state */});
  }, []);

  const categories = [
    {
      id: 'soc',
      name: 'SOC',
      title: 'Security Operations Center',
      description: 'Surveillance et détection des menaces en temps réel pour votre infrastructure',
      icon: Shield,
      color: '#00B4D8',
      count: 2,
    },
    {
      id: 'edr',
      name: 'EDR',
      title: 'Endpoint Detection & Response',
      description: 'Protection avancée des postes de travail et détection comportementale',
      icon: Laptop,
      color: '#8B5CF6',
      count: 2,
    },
    {
      id: 'xdr',
      name: 'XDR',
      title: 'Extended Detection & Response',
      description: "Vision unifiée et corrélation des menaces sur l'ensemble de votre SI",
      icon: Globe,
      color: '#10B981',
      count: 2,
    },
  ];


  const stats = [
    { value: '500+', label: 'Entreprises protégées', icon: Users },
    { value: '99.9%', label: 'Uptime garanti', icon: CheckCircle },
    { value: '24/7', label: 'Support SOC dédié', icon: Clock },
    { value: '< 5min', label: "Temps de réponse", icon: Zap },
  ];

  const steps = [
    {
      number: '01',
      title: 'Choisissez votre solution',
      description: 'Parcourez notre catalogue et sélectionnez la solution adaptée à vos besoins (SOC, EDR, XDR)',
    },
    {
      number: '02',
      title: 'Déployez en quelques minutes',
      description: "Nos solutions SaaS s'intègrent facilement à votre infrastructure existante sans configuration complexe",
    },
    {
      number: '03',
      title: 'Protégez-vous en temps réel',
      description: "Bénéficiez d'une surveillance continue et d'une réponse automatisée aux incidents 24h/24",
    },
  ];

  return (
    <div className="bg-[#0A1628]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00B4D8]/10 via-transparent to-[#8B5CF6]/10" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00B4D8]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#00B4D8 1px, transparent 1px), linear-gradient(90deg, #00B4D8 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-28 relative">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-full mb-8">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
              <span className="text-[#00B4D8] text-sm font-medium">
                Nouveau : Conformité NIS2 &amp; ISO 27001 intégrée
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Protégez votre entreprise avec les solutions{' '}
              <span className="text-[#00B4D8]">Cyna</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Découvrez nos solutions SaaS de cybersécurité de nouvelle génération : SOC, EDR et XDR.
              Détection intelligente, réponse automatisée, conformité garantie.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-all hover:gap-3"
              >
                Découvrir nos solutions
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/20 text-white font-semibold rounded-lg hover:border-white/40 hover:bg-white/5 transition-all">
                Essai gratuit 14 jours
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#00B4D8]/10 border border-[#00B4D8]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Nos catégories de solutions</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Chaque solution est conçue pour répondre à des besoins spécifiques de cybersécurité en entreprise
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={`/catalogue?category=${category.id}`}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8 hover:border-white/20 transition-all hover:scale-[1.02]"
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                  style={{ backgroundColor: `${category.color}15`, border: `1px solid ${category.color}30` }}
                >
                  <Icon className="w-8 h-8" style={{ color: category.color }} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-1">{category.name}</h3>
                <p className="text-sm font-medium mb-3" style={{ color: category.color }}>
                  {category.title}
                </p>
                <p className="text-gray-400 leading-relaxed mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{category.count} solutions disponibles</span>
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm font-medium"
                    style={{ color: category.color }}
                  >
                    Explorer <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white/[0.02] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Comment ça marche ?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Déployez votre protection cybersécurité en 3 étapes simples
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#00B4D8]/40 to-[#00B4D8]/10" />
                )}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00B4D8]/20 to-[#00B4D8]/5 border-2 border-[#00B4D8]/40 rounded-2xl mb-6 mx-auto relative z-10">
                  <span className="text-2xl font-bold text-[#00B4D8]">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Products */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
            <h2 className="text-3xl font-bold text-white">Top Produits du moment</h2>
          </div>
          <Link
            to="/catalogue"
            className="text-[#00B4D8] hover:underline text-sm font-medium flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProducts.length > 0
            ? topProducts.map((product) => {
                const color = getCategoryColor(product.category);
                return (
                  <div
                    key={product.id}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all hover:scale-[1.02] group"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${color}20`,
                            color,
                            border: `1px solid ${color}40`,
                          }}
                        >
                          {product.category}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-6 leading-relaxed min-h-[60px]">{product.description}</p>
                      <div className="flex items-end justify-between mb-5">
                        <div>
                          <span className="text-3xl font-bold text-[#00B4D8]">
                            {product.price_monthly.toLocaleString('fr-FR')}€
                          </span>
                          <span className="text-gray-400">/mois</span>
                        </div>
                        <span className="text-xs text-gray-500">Facturation mensuelle</span>
                      </div>
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                      <Link
                        to={`/produit/${product.id}`}
                        className="flex-1 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-center hover:bg-[#0096B8] transition-colors"
                      >
                        Voir le produit
                      </Link>
                      <Link
                        to={`/produit/${product.id}`}
                        className="px-4 py-3 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                      >
                        Essai
                      </Link>
                    </div>
                  </div>
                );
              })
            : /* Skeleton loader */ [1, 2, 3].map((i) => (
                <div key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden animate-pulse">
                  <div className="p-6">
                    <div className="h-6 bg-white/5 rounded mb-4 w-3/4" />
                    <div className="h-4 bg-white/5 rounded mb-2 w-full" />
                    <div className="h-4 bg-white/5 rounded mb-6 w-2/3" />
                    <div className="h-8 bg-white/5 rounded w-1/2" />
                  </div>
                  <div className="px-6 pb-6">
                    <div className="h-10 bg-white/5 rounded" />
                  </div>
                </div>
              ))
          }
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00B4D8]/10 to-[#8B5CF6]/10" />
        <div className="max-w-7xl mx-auto px-6 py-20 relative text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à sécuriser votre infrastructure ?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Rejoignez plus de 500 entreprises qui font confiance à CYNA pour leur cybersécurité.
            Essai gratuit 14 jours, sans engagement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-all"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-lg hover:border-white/40 hover:bg-white/5 transition-all"
            >
              Parler à un expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
