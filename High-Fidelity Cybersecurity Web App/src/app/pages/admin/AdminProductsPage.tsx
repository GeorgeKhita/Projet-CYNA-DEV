import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Shield, Laptop, Globe, ToggleLeft, ToggleRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: 'SOC' | 'EDR' | 'XDR';
  categoryColor: string;
  priceMonthly: number;
  priceAnnual: number;
  available: boolean;
  popular: boolean;
}

const initialProducts: Product[] = [
  { id: 1, name: 'Cyna SOC Premium', category: 'SOC', categoryColor: '#00B4D8', priceMonthly: 1299, priceAnnual: 1079, available: true, popular: true },
  { id: 2, name: 'Cyna EDR Enterprise', category: 'EDR', categoryColor: '#8B5CF6', priceMonthly: 899, priceAnnual: 746, available: true, popular: true },
  { id: 3, name: 'Cyna XDR Suite', category: 'XDR', categoryColor: '#10B981', priceMonthly: 1799, priceAnnual: 1493, available: true, popular: true },
  { id: 4, name: 'Cyna SOC Essentials', category: 'SOC', categoryColor: '#00B4D8', priceMonthly: 699, priceAnnual: 580, available: true, popular: false },
  { id: 5, name: 'Cyna EDR Pro', category: 'EDR', categoryColor: '#8B5CF6', priceMonthly: 1199, priceAnnual: 995, available: false, popular: false },
  { id: 6, name: 'Cyna XDR Enterprise', category: 'XDR', categoryColor: '#10B981', priceMonthly: 2499, priceAnnual: 2074, available: true, popular: false },
];

const categoryIcons = { SOC: Shield, EDR: Laptop, XDR: Globe };

type FormState = Omit<Product, 'id'> & { id?: number };

const emptyForm: FormState = {
  name: '',
  category: 'SOC',
  categoryColor: '#00B4D8',
  priceMonthly: 0,
  priceAnnual: 0,
  available: true,
  popular: false,
};

const categoryColors: Record<string, string> = {
  SOC: '#00B4D8',
  EDR: '#8B5CF6',
  XDR: '#10B981',
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({ ...p });
    setShowForm(true);
  };

  const saveProduct = () => {
    if (!form.name || !form.priceMonthly) return;
    const color = categoryColors[form.category];
    if (form.id) {
      setProducts((prev) =>
        prev.map((p) => (p.id === form.id ? { ...(form as Product), categoryColor: color } : p))
      );
    } else {
      setProducts((prev) => [
        ...prev,
        { ...(form as Product), id: Date.now(), categoryColor: color },
      ]);
    }
    setShowForm(false);
  };

  const confirmDelete = (id: number) => setDeleteId(id);

  const doDelete = () => {
    if (deleteId !== null) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  const toggleAvailable = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Produits SaaS</h1>
          <p className="text-gray-400">{products.length} produit{products.length > 1 ? 's' : ''} au catalogue</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau produit
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
        />
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Produit</th>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Catégorie</th>
              <th className="text-right px-6 py-4 text-gray-400 text-sm font-medium">Mensuel</th>
              <th className="text-right px-6 py-4 text-gray-400 text-sm font-medium">Annuel</th>
              <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Dispo</th>
              <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((product) => {
              const Icon = categoryIcons[product.category];
              return (
                <tr key={product.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${product.categoryColor}20`, border: `1px solid ${product.categoryColor}40` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: product.categoryColor }} />
                      </div>
                      <div>
                        <div className="text-white font-medium">{product.name}</div>
                        {product.popular && (
                          <span className="text-[#F59E0B] text-xs font-semibold">★ Populaire</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${product.categoryColor}20`, color: product.categoryColor, border: `1px solid ${product.categoryColor}40` }}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white font-semibold">{product.priceMonthly.toLocaleString('fr-FR')}€</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-gray-400">{product.priceAnnual.toLocaleString('fr-FR')}€</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleAvailable(product.id)} className="transition-colors">
                      {product.available ? (
                        <ToggleRight className="w-7 h-7 text-[#10B981]" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#00B4D8]/20 hover:border-[#00B4D8]/40 transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-300" />
                      </button>
                      <button
                        onClick={() => confirmDelete(product.id)}
                        className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#EF4444]/20 hover:border-[#EF4444]/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500">Aucun produit trouvé</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowForm(false)} />
          <div className="relative bg-[#0F1F3A] border border-white/10 rounded-xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {form.id ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-1">Nom du produit</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                  placeholder="Cyna SOC Premium"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-1">Catégorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as 'SOC' | 'EDR' | 'XDR' }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                >
                  <option value="SOC">SOC</option>
                  <option value="EDR">EDR</option>
                  <option value="XDR">XDR</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-1">Prix mensuel (€)</label>
                  <input
                    type="number"
                    value={form.priceMonthly || ''}
                    onChange={(e) => setForm((f) => ({ ...f, priceMonthly: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-1">Prix annuel (€/mois)</label>
                  <input
                    type="number"
                    value={form.priceAnnual || ''}
                    onChange={(e) => setForm((f) => ({ ...f, priceAnnual: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-300 text-sm">Disponible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-300 text-sm">Populaire</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={saveProduct}
                className="flex-1 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
              >
                {form.id ? 'Enregistrer' : 'Créer le produit'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[#0F1F3A] border border-white/10 rounded-xl p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-[#EF4444]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Supprimer ce produit ?</h3>
            <p className="text-gray-400 text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={doDelete}
                className="flex-1 py-3 bg-[#EF4444] text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
