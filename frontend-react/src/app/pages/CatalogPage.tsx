import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../../api/client';
import { CATEGORY_COLORS } from '../../lib/cart';
import { ProductVisual } from '../components/ProductVisual';

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
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-3">Catalogue des solutions</h1>
          <p className="text-muted-foreground text-lg">
            {filteredAndSortedProducts.length} solution{filteredAndSortedProducts.length !== 1 ? 's' : ''} disponible{filteredAndSortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="cyna-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..." className="field field-icon" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${selectedCategory === cat.id ? 'bg-[#00B4D8] text-[#06222C] shadow-[var(--shadow-cyan)]' : 'bg-bg-subtle text-ink-soft hover:bg-bg-muted'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-card border border-border rounded-xl px-4 py-2.5 text-ink focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8]">
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
            <p className="text-muted-foreground">Chargement des produits...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-2">Aucun produit trouvé</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="btn btn-primary mt-4">
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
                  className={`cyna-card overflow-hidden flex flex-col ${available ? 'cyna-card-hover' : 'opacity-60'}`}>
                  <div className="h-36 border-b border-border bg-bg-subtle">
                    <ProductVisual category={product.category} color={color} size="sm" />
                  </div>
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-bold text-ink">{product.name}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {product.popular && (
                          <span className="px-2 py-0.5 bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 rounded text-xs font-semibold">Populaire</span>
                        )}
                        <span className="chip" style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}>
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-muted-foreground mb-4 leading-relaxed min-h-[48px] text-sm">{product.description}</p>
                    <div className="flex items-end justify-between mb-4 mt-auto">
                      <div>
                        <span className="text-3xl font-bold text-ink">{product.price_monthly?.toLocaleString('fr-FR')}€</span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                    </div>
                    {available ? (
                      <div className="flex gap-2">
                        <Link to={`/produit/${product.id}`} className="btn btn-primary flex-1">
                          Voir le produit
                        </Link>
                        <Link to={`/produit/${product.id}`} className="btn btn-ghost">
                          Essai
                        </Link>
                      </div>
                    ) : (
                      <button disabled className="btn btn-ghost btn-block" style={{ cursor: 'not-allowed' }}>
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
