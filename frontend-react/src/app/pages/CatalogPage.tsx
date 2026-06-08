import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, SlidersHorizontal } from 'lucide-react';

export function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const products = [
    {
      id: 1,
      name: 'Cyna SOC Premium',
      category: 'SOC',
      categoryColor: '#00B4D8',
      description: 'Surveillance 24/7, détection temps réel, analyse comportementale avancée',
      price: 1299,
      available: true,
      popular: true,
    },
    {
      id: 2,
      name: 'Cyna EDR Enterprise',
      category: 'EDR',
      categoryColor: '#8B5CF6',
      description: 'Protection endpoint intelligente, réponse automatisée, IOC scanning',
      price: 899,
      available: true,
      popular: true,
    },
    {
      id: 3,
      name: 'Cyna XDR Suite',
      category: 'XDR',
      categoryColor: '#10B981',
      description: 'Vision unifiée, corrélation multi-vecteurs, orchestration SOAR',
      price: 1799,
      available: true,
      popular: true,
    },
    {
      id: 4,
      name: 'Cyna SOC Essentials',
      category: 'SOC',
      categoryColor: '#00B4D8',
      description: "Solution SOC d'entrée de gamme pour PME, monitoring essentiel",
      price: 699,
      available: true,
      popular: false,
    },
    {
      id: 5,
      name: 'Cyna EDR Pro',
      category: 'EDR',
      categoryColor: '#8B5CF6',
      description: 'Protection EDR avancée avec machine learning et threat hunting',
      price: 1199,
      available: false,
      popular: false,
    },
    {
      id: 6,
      name: 'Cyna XDR Enterprise',
      category: 'XDR',
      categoryColor: '#10B981',
      description: 'Solution XDR complète, intégration SIEM, threat intelligence',
      price: 2499,
      available: true,
      popular: false,
    },
  ];

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'SOC', label: 'SOC' },
    { id: 'EDR', label: 'EDR' },
    { id: 'XDR', label: 'XDR' },
  ];

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
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        result = [...result].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Catalogue des solutions</h1>
          <p className="text-gray-400 text-lg">
            {filteredAndSortedProducts.length} solution
            {filteredAndSortedProducts.length !== 1 ? 's' : ''} disponible
            {filteredAndSortedProducts.length !== 1 ? 's' : ''}
          </p>
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

        {/* Products Grid or Empty State */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">Aucun produit trouvé</p>
            <p className="text-gray-500 mb-6">Essayez avec d'autres mots-clés ou catégories</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProducts.map((product) => (
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
                          backgroundColor: `${product.categoryColor}20`,
                          color: product.categoryColor,
                          border: `1px solid ${product.categoryColor}40`,
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
                        {product.price.toLocaleString('fr-FR')}€
                      </span>
                      <span className="text-gray-400">/mois</span>
                    </div>
                  </div>

                  {product.available ? (
                    <div className="flex gap-2">
                      <Link
                        to={`/produit/${product.id}`}
                        className="flex-1 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-center hover:bg-[#0096B8] transition-colors"
                      >
                        Voir le produit
                      </Link>
                      <Link
                        to={`/produit/${product.id}`}
                        className="px-4 py-3 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors text-sm"
                      >
                        Essai
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
