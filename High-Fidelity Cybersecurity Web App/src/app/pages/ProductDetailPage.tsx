import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Shield, Laptop, Globe, Check, Star, ShoppingCart, CheckCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { getProduct, getProducts, type Product } from '../api/products';

const CATEGORY_COLORS: Record<string, string> = {
  SOC: '#00B4D8',
  EDR: '#8B5CF6',
  XDR: '#10B981',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  SOC: Shield,
  EDR: Laptop,
  XDR: Globe,
};

const getCategoryColor = (category: string): string =>
  CATEGORY_COLORS[category?.toUpperCase()] ?? '#00B4D8';

const getCategoryIcon = (category: string): React.ElementType =>
  CATEGORY_ICONS[category?.toUpperCase()] ?? Shield;

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]   = useState<Product | null>(null);
  const [similar, setSimilar]   = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [added, setAdded]       = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getProduct(Number(id))
      .then((p) => {
        setProduct(p);
        // Load similar products
        getProducts()
          .then((all) => {
            const others = all.filter((x) => x.id !== p.id);
            const sameCategory = others.filter((x) => x.category === p.category);
            const different = others.filter((x) => x.category !== p.category);
            setSimilar([...sameCategory, ...different].slice(0, 3));
          })
          .catch(() => {/* ignore similar products error */});
      })
      .catch(() => setError('Produit introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const color = getCategoryColor(product.category);
    const price = selectedPlan === 'monthly' ? product.price_monthly : product.price_annual;
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      categoryColor: color,
      subscriptionType: selectedPlan === 'monthly' ? 'Mensuel' : 'Annuel',
      price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          Chargement...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 mb-6 inline-flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error || 'Produit introuvable.'}</span>
          </div>
          <div className="mt-4">
            <Link to="/catalogue" className="flex items-center gap-2 text-[#00B4D8] hover:underline justify-center">
              <ArrowLeft className="w-4 h-4" />
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const color = getCategoryColor(product.category);
  const Icon = getCategoryIcon(product.category);
  const currentPrice = selectedPlan === 'monthly' ? product.price_monthly : product.price_annual;
  const savings = Math.round(100 - (product.price_annual / product.price_monthly) * 100);

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back link */}
        <Link to="/catalogue" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left - Product Visual */}
          <div
            className="relative border border-white/10 rounded-xl p-12 flex items-center justify-center min-h-[500px]"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${color}12, transparent 65%), linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
            }}
          >
            <div className="relative text-center">
              <div
                className="w-48 h-48 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}99)`,
                  boxShadow: `0 25px 50px -12px ${color}40`,
                }}
              >
                <Icon className="w-24 h-24 text-white" />
              </div>
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  border: `1px solid ${color}40`,
                }}
              >
                {product.category}
              </span>
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h1 className="text-4xl font-bold text-white">{product.name}</h1>
              {product.popular && (
                <span className="px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#8B5CF6]" />
                  Populaire
                </span>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed mb-8 text-lg">{product.description}</p>

            {/* Plan Selector */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">Choisir un plan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlan === 'monthly'
                      ? 'border-[#00B4D8] bg-[#00B4D8]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-white font-semibold">Mensuel</div>
                  <div className="text-sm text-gray-400">Facturation mensuelle</div>
                </button>
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                    selectedPlan === 'annual'
                      ? 'border-[#00B4D8] bg-[#00B4D8]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {savings > 0 && (
                    <div className="absolute -top-2 -right-2 bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{savings}%
                    </div>
                  )}
                  <div className="text-white font-semibold">Annuel</div>
                  <div className="text-sm text-gray-400">
                    {savings > 0 ? `Économisez ${savings}%` : 'Facturation annuelle'}
                  </div>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#00B4D8]">
                  {currentPrice.toLocaleString('fr-FR')}€
                </span>
                <span className="text-xl text-gray-400">/mois</span>
              </div>
              {selectedPlan === 'annual' && (
                <p className="text-sm text-gray-400 mt-2">
                  Soit {(product.price_annual * 12).toLocaleString('fr-FR')}€ facturés annuellement
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {product.available ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-4 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                      added
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#00B4D8] text-[#0A1628] hover:bg-[#0096B8]'
                    }`}
                  >
                    {added ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Ajouté au panier !
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Ajouter au panier
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/panier')}
                    className="flex-1 py-4 bg-transparent border-2 border-[#00B4D8] text-[#00B4D8] font-semibold rounded-lg hover:bg-[#00B4D8]/10 transition-colors"
                  >
                    Essai gratuit 14 jours
                  </button>
                </>
              ) : (
                <button disabled className="flex-1 py-4 bg-white/5 text-gray-500 font-semibold rounded-lg cursor-not-allowed">
                  Bientôt disponible
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Services similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similar.map((s) => {
                const SimilarIcon = getCategoryIcon(s.category);
                const simColor = getCategoryColor(s.category);
                return (
                  <Link
                    key={s.id}
                    to={`/produit/${s.id}`}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:scale-[1.02] group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${simColor}15`, border: `1px solid ${simColor}30` }}
                      >
                        <SimilarIcon className="w-5 h-5" style={{ color: simColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#00B4D8] transition-colors truncate">
                          {s.name}
                        </h3>
                        <span className="text-xs font-semibold" style={{ color: simColor }}>
                          {s.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#00B4D8]">
                      {s.price_monthly.toLocaleString('fr-FR')}€
                      <span className="text-sm text-gray-400">/mois</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
