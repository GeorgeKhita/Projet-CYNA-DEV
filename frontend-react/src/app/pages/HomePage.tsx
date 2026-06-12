import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Shield, Laptop, Globe, ArrowRight, Star, Zap, Clock, Users, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';
import { CATEGORY_COLORS } from '../../lib/cart';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle?: string;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
}

const CATEGORY_ICONS: Record<string, any> = { SOC: Shield, EDR: Laptop, XDR: Globe };
const CATEGORY_TITLES: Record<string, string> = {
  SOC: 'Security Operations Center',
  EDR: 'Endpoint Detection & Response',
  XDR: 'Extended Detection & Response',
};

const stats = [
  { value: '500+',   label: 'Entreprises protégées', icon: Users },
  { value: '99.9%',  label: 'Uptime garanti',        icon: CheckCircle },
  { value: '24/7',   label: 'Support SOC dédié',     icon: Clock },
  { value: '< 5min', label: 'Temps de réponse',      icon: Zap },
];

const steps = [
  { number: '01', title: 'Choisissez votre solution',    description: 'Parcourez notre catalogue et sélectionnez la solution adaptée à vos besoins (SOC, EDR, XDR)' },
  { number: '02', title: 'Déployez en quelques minutes', description: "Nos solutions SaaS s'intègrent facilement à votre infrastructure existante sans configuration complexe" },
  { number: '03', title: 'Protégez-vous en temps réel',  description: "Bénéficiez d'une surveillance continue et d'une réponse automatisée aux incidents 24h/24" },
];

export function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => setCurrentSlide(i => (i + 1) % slides.length), [slides.length]);
  const prevSlide = () => setCurrentSlide(i => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    api.get<any[]>('/categories').then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
    api.get<any[]>('/products').then(data => {
      const list = Array.isArray(data) ? data : [];
      setTopProducts(list.filter(p => p.status === 'available').slice(0, 3));
    }).catch(() => {});
    api.get<CarouselSlide[]>('/carousel').then(data => setSlides(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  return (
    <div className="bg-background">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-bg-subtle to-background">
        {/* décor */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[36rem] h-[36rem] bg-[#00B4D8]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[32rem] h-[32rem] bg-[#7C5CFC]/10 rounded-full blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: 'radial-gradient(circle, #C9D3E0 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative">
          <div className="max-w-3xl fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full mb-8 shadow-[var(--shadow-sm)]">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
              <span className="text-ink-soft text-sm font-semibold">Nouveau : Conformité NIS2 &amp; ISO 27001 intégrée</span>
            </div>
            <h1 className="text-5xl lg:text-[4.25rem] font-bold text-ink mb-6 leading-[1.05]">
              Protégez votre entreprise avec les solutions{' '}
              <span className="bg-gradient-to-r from-[#00B4D8] to-[#7C5CFC] bg-clip-text text-transparent">Cyna</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
              Découvrez nos solutions SaaS de cybersécurité de nouvelle génération : SOC, EDR et XDR.
              Détection intelligente, réponse automatisée, conformité garantie.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalogue" className="btn btn-primary btn-lg">
                Découvrir nos solutions <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/catalogue" className="btn btn-ghost btn-lg">
                Essai gratuit 14 jours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CAROUSEL (slides admin) ===================== */}
      {slides.length > 0 && (
        <section className="relative overflow-hidden border-y border-border bg-bg-subtle">
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <div className="relative min-h-[180px] flex items-center">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 flex items-center transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-ink mb-2">{slide.title}</h2>
                    {slide.subtitle && <p className="text-muted-foreground text-lg mb-4">{slide.subtitle}</p>}
                    {slide.cta_text && slide.cta_url && (
                      <Link to={slide.cta_url} className="btn btn-primary">
                        {slide.cta_text} <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                  {slide.image_url && (
                    <div className="hidden md:block flex-shrink-0 ml-8">
                      <img src={slide.image_url} alt={slide.title} className="h-32 w-auto object-contain rounded-xl" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {slides.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-[#00B4D8] w-6' : 'bg-[#CBD3DF] w-2'}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={prevSlide} className="p-2 rounded-full bg-card border border-border hover:border-[#00B4D8] transition-colors shadow-[var(--shadow-xs)]">
                    <ChevronLeft className="w-4 h-4 text-ink-soft" />
                  </button>
                  <button onClick={nextSlide} className="p-2 rounded-full bg-card border border-border hover:border-[#00B4D8] transition-colors shadow-[var(--shadow-xs)]">
                    <ChevronRight className="w-4 h-4 text-ink-soft" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================== STATS ===================== */}
      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00B4D8]/10 border border-[#00B4D8]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-ink">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== CATÉGORIES ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-ink mb-4">Nos catégories de solutions</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Chaque solution est conçue pour répondre à des besoins spécifiques de cybersécurité en entreprise</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(categories.length > 0 ? categories : [
            { name: 'SOC', description: 'Surveillance et détection des menaces en temps réel', color: '#00B4D8', products_count: 2 },
            { name: 'EDR', description: 'Protection avancée des postes de travail',            color: '#7C5CFC', products_count: 2 },
            { name: 'XDR', description: "Vision unifiée sur l'ensemble de votre SI",           color: '#10B981', products_count: 2 },
          ]).map(cat => {
            const Icon = CATEGORY_ICONS[cat.name] ?? Shield;
            const color = cat.color ?? CATEGORY_COLORS[cat.name] ?? '#00B4D8';
            return (
              <Link key={cat.name} to="/catalogue" className="cyna-card cyna-card-hover group relative p-8 overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}40)` }}
                />
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-8 h-8" style={{ color }} />
                </div>
                <h3 className="text-2xl font-bold text-ink mb-1">{cat.name}</h3>
                <p className="text-sm font-semibold mb-3" style={{ color }}>{CATEGORY_TITLES[cat.name] ?? cat.name}</p>
                <p className="text-muted-foreground leading-relaxed mb-5">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{cat.products_count ?? 0} solutions disponibles</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm font-semibold" style={{ color }}>
                    Explorer <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===================== COMMENT ÇA MARCHE ===================== */}
      <section className="section-muted border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-ink mb-4">Comment ça marche ?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Déployez votre protection cybersécurité en 3 étapes simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#00B4D8]/40 to-[#00B4D8]/5" />
                )}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-card border border-border rounded-3xl mb-6 mx-auto relative z-10 shadow-[var(--shadow-md)]">
                  <span className="text-2xl font-bold text-[#00B4D8]">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TOP PRODUITS ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
            <h2 className="text-4xl font-bold text-ink">Top Produits du moment</h2>
          </div>
          <Link to="/catalogue" className="text-primary hover:text-[#00B4D8] text-sm font-semibold flex items-center gap-1">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProducts.map(product => {
            const color = product.category_color ?? CATEGORY_COLORS[product.category] ?? '#00B4D8';
            return (
              <div key={product.id} className="cyna-card cyna-card-hover overflow-hidden group flex flex-col">
                <div className="h-2" style={{ background: `linear-gradient(90deg, ${color}, ${color}30)` }} />
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-ink">{product.name}</h3>
                    <span className="chip" style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}>
                      {product.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold text-ink">{product.price_monthly?.toLocaleString('fr-FR')}€</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Facturation mensuelle</span>
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <Link to={`/produit/${product.id}`} className="btn btn-primary flex-1">
                    Voir le produit
                  </Link>
                  <Link to={`/produit/${product.id}`} className="btn btn-ghost">
                    Essai
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0A1628] to-[#13243f] px-8 py-16 lg:px-16 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#00B4D8]/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#7C5CFC]/20 rounded-full blur-[100px]" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">Prêt à sécuriser votre infrastructure ?</h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Rejoignez plus de 500 entreprises qui font confiance à CYNA. Essai gratuit 14 jours, sans engagement.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/catalogue" className="btn btn-primary btn-lg">
                  Commencer maintenant <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:-translate-y-0.5">
                  Parler à un expert
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
