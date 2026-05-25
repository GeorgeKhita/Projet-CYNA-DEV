import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal, ShoppingCart, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { getProducts, type Product } from '../api/products';

const CATEGORY_COLORS: Record<string, string> = {
  SOC: '#00B4D8',
  EDR: '#8B5CF6',
  XDR: '#10B981',
};

const getCategoryColor = (category: string): string =>
  CATEGORY_COLORS[category?.toUpperCase()] ?? '#00B4D8';

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const urlSearch   = searchParams.get('search') ?? '';
  const urlCategory = searchParams.get('category')?.toUpperCase() ?? 'all';

  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory === 'ALL' ? 'all' : urlCategory);
  const [sortBy, setSortBy]           = useState('popular');
  const [addedId, setAddedId]         = useState<number | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setError('Impossible de charger le catalogue.'))
      .finally(() => setLoading(false));
  }, []);

  // Build dynamic category list from loaded products
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return [{ id: 'all', label: 'Tous' }, ...cats.map((c) => ({ id: c, label: c }))];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price_monthly - b.price_monthly);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price_monthly - a.price_monthly);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        result = [...result].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (product: Product) => {
    const color = getCategoryColor(product.category);
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      categoryColor: color,
      subscriptionType: 'Mensuel',
      price: product.price_monthly,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Catalogue des solutions</h1>
          {!loading && !error && (
            <p className="text-gray-400 text-lg">
              {filteredAndSortedProducts.length} solution
              {filteredAndSortedProducts.length !== 1 ? 's' : ''} disponible
              {filteredAndSortedProducts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Filter Bar */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#00B4D8] text-[#0A1628]'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
              >
                <option value="popular">Popularité</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 text-gray-400 py-20">
            <Loader2 className="w-6 h-6 animate-spin" />
            Chargement du catalogue...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Products Grid or Empty State */}
        {!loading && !error && (
          filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-2">Aucun produit trouvé</p>
              <p className="text-gray-500 mb-6">Essayez avec d'autres mots-clés ou catégories</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => {
                const color = getCategoryColor(product.category);
                return (
                  <div
                    key={product.id}
                    className={`bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden transition-all ${
                      !product.available ? 'opacity-60' : 'hover:border-white/20 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="bg-gradient-to-r from-white/5 to-transparent p-6 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          {product.popular && (
                            <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 rounded text-xs font-semibold">
                              Populaire
                            </span>
                          )}
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
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-400 mb-6 leading-relaxed min-h-[60px]">{product.description}</p>

                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <span className="text-3xl font-bold text-[#00B4D8]">
                            {product.price_monthly.toLocaleString('fr-FR')}€
                          </span>
                          <span className="text-gray-400">/mois</span>
                        </div>
                        {product.price_annual && (
                          <span className="text-xs text-gray-500">
                            ou {product.price_annual.toLocaleString('fr-FR')}€/an
                          </span>
                        )}
                      </div>

                      {product.available ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`flex-1 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                              addedId === product.id
                                ? 'bg-[#10B981] text-white'
                                : 'bg-[#00B4D8] text-[#0A1628] hover:bg-[#0096B8]'
                            }`}
                          >
                            {addedId === product.id ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Ajouté !
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                Ajouter
                              </>
                            )}
                          </button>
                          <Link
                            to={`/produit/${product.id}`}
                            className="px-4 py-3 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                          >
                            Détails
                          </Link>
                        </div>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 bg-white/5 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                        >
                          Bientôt disponible
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
