import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Shield, Laptop, Globe, Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminToggleProduct, type Product } from '../../api/products';

const categoryIcons: Record<string, React.ElementType> = { SOC: Shield, EDR: Laptop, XDR: Globe };
const categoryColors: Record<string, string> = { SOC: '#00B4D8', EDR: '#8B5CF6', XDR: '#10B981' };

type FormState = Omit<Product, 'id' | 'created_at'> & { id?: number };
const emptyForm: FormState = { name: '', category: 'SOC', description: '', price_monthly: 0, price_annual: 0, available: true, popular: false };

export function AdminProductsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<FormState>(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminGetProducts()
      .then((r) => setProducts(r.data))
      .catch(() => setError('Impossible de charger les produits.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({ id: p.id, name: p.name, category: p.category, description: p.description, price_monthly: p.price_monthly, price_annual: p.price_annual, available: p.available, popular: p.popular });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await adminUpdateProduct(form.id, form);
      } else {
        await adminCreateProduct(form);
      }
      setShowForm(false);
      load();
    } catch {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminDeleteProduct(id);
      setDeleteId(null);
      load();
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await adminToggleProduct(id);
      load();
    } catch {
      alert('Erreur lors de la mise à jour.');
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Produits</h1>
          <p className="text-gray-400">Gérez le catalogue SaaS</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
          <Plus className="w-5 h-5" /> Nouveau produit
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          type="text" placeholder="Rechercher un produit..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
      </div>

      {loading && <div className="flex items-center gap-3 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin" />Chargement...</div>}
      {error && <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4"><AlertCircle className="w-5 h-5 text-red-400" /><span className="text-red-400">{error}</span></div>}

      {!loading && (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Produit', 'Catégorie', 'Mensuel', 'Annuel', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-gray-400 text-sm font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const Icon = categoryIcons[p.category] ?? Shield;
                const color = categoryColors[p.category] ?? '#00B4D8';
                return (
                  <tr key={p.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${!p.available ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{p.name}</div>
                      {p.popular && <span className="text-xs text-[#F59E0B] font-medium">⭐ Populaire</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color }}>{p.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">{p.price_monthly.toLocaleString('fr-FR')}€</td>
                    <td className="px-6 py-4 text-gray-300">{p.price_annual.toLocaleString('fr-FR')}€</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggle(p.id)} className="flex items-center gap-2 text-sm font-medium transition-colors">
                        {p.available
                          ? <><ToggleRight className="w-5 h-5 text-[#10B981]" /><span className="text-[#10B981]">Disponible</span></>
                          : <><ToggleLeft className="w-5 h-5 text-red-400" /><span className="text-red-400">Indisponible</span></>}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1F3A] border border-white/10 rounded-xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">{form.id ? 'Modifier' : 'Créer'} un produit</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Nom</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputCls} placeholder="Cyna SOC Premium" />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Catégorie</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as 'SOC' | 'EDR' | 'XDR' })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]">
                  {['SOC', 'EDR', 'XDR'].map((c) => <option key={c} value={c} className="bg-[#0F1F3A]">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`} rows={2} placeholder="Description du service..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Prix mensuel (€)</label>
                  <input type="number" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })} required min={0} className={inputCls} />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Prix annuel (€)</label>
                  <input type="number" value={form.price_annual} onChange={(e) => setForm({ ...form, price_annual: Number(e.target.value) })} required min={0} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="w-4 h-4 accent-[#00B4D8]" />
                  <span className="text-white text-sm">Disponible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} className="w-4 h-4 accent-[#F59E0B]" />
                  <span className="text-white text-sm">Populaire</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-white/10 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1F3A] border border-white/10 rounded-xl p-8 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Supprimer ce produit ?</h3>
            <p className="text-gray-400 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-white/10 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
