import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal, LayoutGrid, List, PackageX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { ProductVisual } from '../components/ProductVisual';

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  display_order: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  category_color?: string;
  category_id: number;
  price_monthly: number;
  price_annual: number;
  status: string;
  priority?: number;
  max_capacity?: number | null;
  subscriptions_count?: number;
  stock_remaining?: number | null;
  in_stock?: boolean;
}

function isAvailable(p: Product): boolean {
  if (p.in_stock !== undefined) return p.in_stock;
  return p.status === 'available';
}

export function CatalogPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'all');
  const [sortBy, setSortBy]       = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    Promise.all([
      api.get<Category[]>('/categories'),
      api.get<Product[]>('/products'),
    ])
      .then(([cats, prods]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        const list = Array.isArray(prods) ? prods : (prods as any).data ?? [];
        setProducts(list);
      })
      .catch(() => setError(t('catalog.error')))
      .finally(() => setLoading(false));
  }, [i18n.language]);

  const activeCategoryData = useMemo(
    () => categories.find(c => c.name === selectedCategory) ?? null,
    [categories, selectedCategory],
  );

  const filteredAndSorted = useMemo(() => {
    const filtered = products.filter(p => {
      const matchCat    = selectedCategory === 'all' || p.category === selectedCategory;
      const q           = searchQuery.toLowerCase();
      const matchSearch = q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    const available   = filtered.filter(isAvailable);
    const unavailable = filtered.filter(p => !isAvailable(p));

    const prioritized   = available.filter(p => p.priority && p.priority > 0)
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    const unprioritized = available.filter(p => !p.priority || p.priority === 0);

    let sorted = [...prioritized, ...unprioritized];

    if (sortBy === 'price-asc')  sorted = [...sorted].sort((a, b) => a.price_monthly - b.price_monthly);
    if (sortBy === 'price-desc') sorted = [...sorted].sort((a, b) => b.price_monthly - a.price_monthly);
    if (sortBy === 'name')       sorted = [...sorted].sort((a, b) => a.name.localeCompare(b.name));

    return [...sorted, ...unavailable];
  }, [products, searchQuery, selectedCategory, sortBy]);

  const categoryColor = activeCategoryData?.color ?? '#00B4D8';

  return (
    <div className="min-h-screen bg-card">

      {/* ── Category banner ───────────────────────────────────────── */}
      {selectedCategory !== 'all' && activeCategoryData && (
        <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, #06222C 0%, ${categoryColor}22 100%)` }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 50%, ${categoryColor}18 0%, transparent 60%)` }} />
          <div className="max-w-7xl mx-auto px-6 py-12 flex items-center gap-8 relative">
            <div className="w-32 h-32 flex-shrink-0 hidden sm:block">
              <ProductVisual category={selectedCategory} color={categoryColor} size="md" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: `${categoryColor}25`, color: categoryColor, border: `1px solid ${categoryColor}40` }}>
                  {t('catalog.category_label')}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">{activeCategoryData.name}</h1>
              <p className="text-white/70 text-lg max-w-2xl">{activeCategoryData.description}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${categoryColor}40, transparent)` }} />
        </div>
      )}

      {/* ── Header when "all" ─────────────────────────────────────── */}
      {selectedCategory === 'all' && (
        <div className="bg-bg-subtle border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-2">{t('catalog.title')}</h1>
            <p className="text-muted-foreground text-lg">{t('catalog.subtitle')}</p>
          </div>
        </div>
      )}

      {/* ── Filters bar ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-3">

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('catalog.search_placeholder')}
                className="w-full bg-bg-subtle border border-border rounded-xl pl-10 pr-4 py-2.5 text-ink text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8] transition-all"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCategory === 'all' ? 'bg-[#00B4D8] text-[#06222C] shadow-[var(--shadow-cyan)]' : 'bg-bg-subtle text-ink-soft hover:bg-bg-muted border border-border'}`}>
                {t('catalog.filter_all')}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${selectedCategory === cat.name
                    ? 'shadow-sm'
                    : 'bg-bg-subtle text-ink-soft hover:bg-bg-muted'}`}
                  style={selectedCategory === cat.name
                    ? { background: cat.color, color: '#fff', borderColor: cat.color }
                    : { borderColor: 'var(--color-border)' }}>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort + view toggle */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="bg-card border border-border rounded-xl px-3 py-2.5 text-ink text-sm focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8]">
                <option value="default">{t('catalog.sort_default')}</option>
                <option value="price-asc">{t('catalog.sort_price_asc')}</option>
                <option value="price-desc">{t('catalog.sort_price_desc')}</option>
                <option value="name">{t('catalog.sort_name')}</option>
              </select>
              <div className="flex border border-border rounded-xl overflow-hidden">
                <button onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[#00B4D8] text-[#06222C]' : 'bg-bg-subtle text-ink-soft hover:bg-bg-muted'}`}
                  title="Grille">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-[#00B4D8] text-[#06222C]' : 'bg-bg-subtle text-ink-soft hover:bg-bg-muted'}`}
                  title="Liste">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Result count */}
          {!loading && !error && (
            <p className="text-xs text-muted-foreground mt-2">
              {filteredAndSorted.length} {filteredAndSorted.length !== 1 ? t('catalog.result_plural') : t('catalog.result_singular')}
              {selectedCategory !== 'all' && ` ${t('catalog.result_in')} ${selectedCategory}`}
            </p>
          )}
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {loading && (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t('catalog.loading')}</p>
          </div>
        )}

        {error && (
          <div className="text-center py-24">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">{t('catalog.retry')}</button>
          </div>
        )}

        {!loading && !error && filteredAndSorted.length === 0 && (
          <div className="text-center py-24">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-ink font-semibold mb-2">{t('catalog.no_results_title')}</p>
            <p className="text-muted-foreground mb-6">{t('catalog.no_results_subtitle')}</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="btn btn-primary">
              {t('catalog.reset_filters')}
            </button>
          </div>
        )}

        {!loading && !error && filteredAndSorted.length > 0 && (
          viewMode === 'grid'
            ? <GridView products={filteredAndSorted} />
            : <ListView products={filteredAndSorted} />
        )}
      </div>
    </div>
  );
}

// ── Grid view ─────────────────────────────────────────────────────────────────

function GridView({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({ products }: { products: Product[] }) {
  return (
    <div className="flex flex-col gap-4">
      {products.map(p => <ProductRow key={p.id} product={p} />)}
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function StockBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-subtle text-muted-foreground border border-border text-xs font-semibold">
      <PackageX className="w-3 h-3" />
      {t('catalog.unavailable')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: number }) {
  const { t } = useTranslation();
  if (priority <= 0) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F59E0B]/10 text-[#B45309] border border-[#F59E0B]/25">
      {t('catalog.recommended')}
    </span>
  );
}

// ── Product card (grid) ───────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const color     = product.category_color ?? '#00B4D8';
  const available = isAvailable(product);

  return (
    <div className={`cyna-card overflow-hidden flex flex-col transition-all duration-200 ${available ? 'cyna-card-hover' : 'opacity-60 grayscale-[30%]'}`}>

      {/* Visual */}
      <div className="h-36 border-b border-border bg-bg-subtle flex-shrink-0">
        <ProductVisual category={product.category} color={color} size="sm" />
      </div>

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-border">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-ink leading-tight">{product.name}</h3>
          <span className="chip flex-shrink-0 text-xs" style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}>
            {product.category}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!available && <StockBadge />}
          {available && product.priority && product.priority > 0 && <PriorityBadge priority={product.priority} />}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{product.description}</p>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-ink">{product.price_monthly?.toLocaleString('fr-FR')}€</span>
            <span className="text-muted-foreground text-sm mb-0.5">{t('catalog.per_month_ht')}</span>
          </div>
          {product.price_annual && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('catalog.per_month_annual', { price: product.price_annual.toLocaleString('fr-FR') })}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4">
          {available ? (
            <Link to={`/produit/${product.id}`} className="btn btn-primary btn-block text-center">
              {t('catalog.view_product')}
            </Link>
          ) : (
            <button disabled className="btn btn-ghost btn-block" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
              {t('catalog.unavailable')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Product row (list) ────────────────────────────────────────────────────────

function ProductRow({ product }: { product: Product }) {
  const { t } = useTranslation();
  const color     = product.category_color ?? '#00B4D8';
  const available = isAvailable(product);

  return (
    <div className={`cyna-card overflow-hidden transition-all duration-200 ${available ? 'cyna-card-hover' : 'opacity-60 grayscale-[30%]'}`}>
      <div className="flex items-stretch">

        {/* Side visual */}
        <div className="w-24 sm:w-32 flex-shrink-0 border-r border-border bg-bg-subtle">
          <ProductVisual category={product.category} color={color} size="sm" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-base font-bold text-ink">{product.name}</h3>
              <span className="chip text-xs" style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}>
                {product.category}
              </span>
              {!available && <StockBadge />}
              {available && product.priority && product.priority > 0 && <PriorityBadge priority={product.priority} />}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-right min-w-[120px]">
              <div className="flex items-end gap-1 justify-end">
                <span className="text-xl font-bold text-ink">{product.price_monthly?.toLocaleString('fr-FR')}€</span>
                <span className="text-muted-foreground text-xs mb-0.5">{t('catalog.per_month_ht')}</span>
              </div>
              {product.price_annual && (
                <p className="text-xs text-muted-foreground">{product.price_annual.toLocaleString('fr-FR')}€/mois annuel</p>
              )}
            </div>
            {available ? (
              <Link to={`/produit/${product.id}`} className="btn btn-primary whitespace-nowrap">
                {t('catalog.view_product')}
              </Link>
            ) : (
              <button disabled className="btn btn-ghost whitespace-nowrap" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
                {t('catalog.unavailable')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
