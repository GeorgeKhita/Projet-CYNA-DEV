import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Shield, Laptop, Globe, Check, Star } from 'lucide-react';
import { api } from '../../api/client';
import { addToCart, CATEGORY_COLORS } from '../../lib/cart';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  features?: string[];
  price_monthly: number;
  price_annual: number;
  status?: string;
  available?: boolean;
  popular?: boolean;
  slug?: string;
}

const CATEGORY_ICONS: Record<string, any> = { SOC: Shield, EDR: Laptop, XDR: Globe };
const CATEGORY_BADGES: Record<string, string> = { SOC: 'Surveillance', EDR: 'Protection', XDR: 'Unification' };

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get<any>(`/products/${id}`)
      .then(res => {
        const p: Product = res.data ?? res;
        setProduct(p);
        return api.get<any>('/products');
      })
      .then(res => {
        const list: Product[] = Array.isArray(res) ? res : (res.data ?? []);
        setRelated(list.filter(p => p.id !== Number(id)).slice(0, 3));
      })
      .catch(() => navigate('/catalogue'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    const color = CATEGORY_COLORS[product.category] ?? '#00B4D8';
    const price = selectedPlan === 'monthly' ? product.price_monthly : product.price_annual;
    addToCart({ id: product.id, name: product.name, category: product.category, categoryColor: color, price, duration: selectedPlan });
    setAddedMsg('Ajouté au panier !');
    setTimeout(() => setAddedMsg(''), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const color = CATEGORY_COLORS[product.category] ?? '#00B4D8';
  const Icon = CATEGORY_ICONS[product.category] ?? Shield;
  const currentPrice = selectedPlan === 'monthly' ? product.price_monthly : product.price_annual;
  const features: string[] = Array.isArray(product.features)
    ? (typeof product.features[0] === 'string' ? product.features : Object.values(product.features))
    : [];

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Visuel */}
          <div className="relative border border-white/10 rounded-xl p-12 flex items-center justify-center min-h-[500px]"
            style={{ background: `radial-gradient(circle at 50% 40%, ${color}12, transparent 65%), linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)` }}>
            <div className="relative text-center">
              <div className="w-48 h-48 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, boxShadow: `0 25px 50px -12px ${color}40` }}>
                <Icon className="w-24 h-24 text-white" />
              </div>
              <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
                style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                {product.category}
              </span>
            </div>
          </div>

          {/* Infos */}
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h1 className="text-4xl font-bold text-white">{product.name}</h1>
              {product.popular && (
                <span className="px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#8B5CF6]" />{CATEGORY_BADGES[product.category] ?? 'Premium'}
                </span>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed mb-8 text-lg">{product.description}</p>

            {features.length > 0 && (
              <div className="space-y-3 mb-8">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 bg-[#10B981]/20 border border-[#10B981]/40 rounded flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#10B981]" />
                    </div>
                    <span className="text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">Choisir un plan</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${selectedPlan === 'monthly' ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <div className="text-white font-semibold">Mensuel</div>
                  <div className="text-sm text-gray-400">Facturation mensuelle</div>
                </button>
                <button onClick={() => setSelectedPlan('annual')}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${selectedPlan === 'annual' ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <div className="absolute -top-2 -right-2 bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full">-17%</div>
                  <div className="text-white font-semibold">Annuel</div>
                  <div className="text-sm text-gray-400">Économisez 17%</div>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#00B4D8]">{currentPrice?.toLocaleString('fr-FR')}€</span>
                <span className="text-xl text-gray-400">/mois</span>
              </div>
              {selectedPlan === 'annual' && product.price_annual && (
                <p className="text-sm text-gray-400 mt-2">Soit {(product.price_annual * 12).toLocaleString('fr-FR')}€ facturés annuellement</p>
              )}
            </div>

            {addedMsg && (
              <div className="mb-4 px-4 py-2 bg-[#10B981]/20 border border-[#10B981]/40 rounded-lg text-[#10B981] text-sm">{addedMsg}</div>
            )}

            <div className="flex gap-3">
              <button onClick={handleAddToCart}
                className="flex-1 py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-center hover:bg-[#0096B8] transition-colors">
                Ajouter au panier
              </button>
              <Link to="/panier"
                className="flex-1 py-4 bg-transparent border-2 border-[#00B4D8] text-[#00B4D8] font-semibold rounded-lg text-center hover:bg-[#00B4D8]/10 transition-colors">
                Voir le panier
              </Link>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Services similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(sim => {
                const simColor = CATEGORY_COLORS[sim.category] ?? '#00B4D8';
                const SimIcon = CATEGORY_ICONS[sim.category] ?? Shield;
                return (
                  <Link key={sim.id} to={`/produit/${sim.id}`}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:scale-[1.02] group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${simColor}15`, border: `1px solid ${simColor}30` }}>
                        <SimIcon className="w-5 h-5" style={{ color: simColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#00B4D8] transition-colors truncate">{sim.name}</h3>
                        <span className="text-xs font-semibold" style={{ color: simColor }}>{sim.category}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#00B4D8]">
                      {sim.price_monthly?.toLocaleString('fr-FR')}€<span className="text-sm text-gray-400">/mois</span>
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
