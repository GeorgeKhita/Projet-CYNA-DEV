import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../../api/client';
import { CATEGORY_COLORS } from '../../lib/cart';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price_monthly: number;
  price_annual: number;
  status: string;
  available?: boolean;
  popular?: boolean;
  priority?: number;
}

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    api.get<{ data: Product[] } | Product[]>('/products')
      .then(res => {
        const list = Array.isArray(res) ? res : (res as any).data ?? [];
        setProducts(list);
      })
      .catch(() => setError('Impossible de charger les produits.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'SOC', label: 'SOC' },
    { id: 'EDR', label: 'EDR' },
    { id: 'XDR', label: 'XDR' },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const available = p.status === 'available' || p.available !== false;
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    switch (sortBy) {
      case 'price-asc':  return [...result].sort((a, b) => a.price_monthly - b.price_monthly);
      case 'price-desc': return [...result].sort((a, b) => b.price_monthly - a.price_monthly);
      case 'name':       return [...result].sort((a, b) => a.name.localeCompare(b.name));
      default:           return [...result].sort((a, b) => (b.popular || b.priority ? 1 : 0) - (a.popular || a.priority ? 1 : 0));
    }
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Catalogue des solutions</h1>
          <p className="text-gray-400 text-lg">
            {filteredAndSortedProducts.length} solution{filteredAndSortedProducts.length !== 1 ? 's' : ''} disponible{filteredAndSortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${selectedCategory === cat.id ? 'bg-[#00B4D8] text-[#0A1628]' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]">
                <option value="popular">Popularité</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Chargement des produits...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">Aucun produit trouvé</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg">
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {!loading && !error && filteredAndSortedProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProducts.map(product => {
              const color = CATEGORY_COLORS[product.category] ?? '#00B4D8';
              const available = product.status === 'available' || product.available !== false;
              return (
                <div key={product.id}
                  className={`bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden transition-all ${!available ? 'opacity-60' : 'hover:border-white/20 hover:scale-[1.01]'}`}>
                  <div className="bg-gradient-to-r from-white/5 to-transparent p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        {product.popular && (
                          <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 rounded text-xs font-semibold">Populaire</span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-400 mb-6 leading-relaxed min-h-[60px]">{product.description}</p>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="text-3xl font-bold text-[#00B4D8]">{product.price_monthly?.toLocaleString('fr-FR')}€</span>
                        <span className="text-gray-400">/mois</span>
                      </div>
                    </div>
                    {available ? (
                      <div className="flex gap-2">
                        <Link to={`/produit/${product.id}`}
                          className="flex-1 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-center hover:bg-[#0096B8] transition-colors">
                          Voir le produit
                        </Link>
                        <Link to={`/produit/${product.id}`}
                          className="px-4 py-3 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors text-sm">
                          Essai
                        </Link>
                      </div>
                    ) : (
                      <button disabled className="w-full py-3 bg-white/5 text-gray-500 font-semibold rounded-lg cursor-not-allowed">
                        Bientôt disponible
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
