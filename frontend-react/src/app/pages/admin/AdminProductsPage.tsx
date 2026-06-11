import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import { api } from '../../../api/client';

interface Product {
  id: number;
  name: string;
  category: string;
  category_color: string;
  category_id: number;
  description: string;
  features: string[];
  price_monthly: number;
  price_annual: number;
  status: string;
  priority: number;
}

interface Category { id: number; name: string; color: string; }

const EMPTY: Omit<Product, 'id'> = {
  name: '', category: '', category_color: '', category_id: 0,
  description: '', features: [], price_monthly: 0, price_annual: 0, status: 'available', priority: 0,
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [current, setCurrent] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<any>('/admin/products').then(d => setProducts(d.data ?? [])),
      api.get<Category[]>('/categories').then(d => setCategories(Array.isArray(d) ? d : [])),
    ]).finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setCurrent({ ...EMPTY });
    setFeaturesInput('');
    setModal('create');
  }

  function openEdit(p: Product) {
    setCurrent({ ...p, features: p.features ?? [] });
    setFeaturesInput((p.features ?? []).join('\n'));
    setModal('edit');
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...current,
        features: featuresInput.split('\n').map(f => f.trim()).filter(Boolean),
      };
      if (modal === 'create') {
        const res = await api.post<Product>('/admin/products', payload);
        setProducts(p => [res, ...p]);
      } else {
        const res = await api.put<Product>(`/admin/products/${current.id}`, payload);
        setProducts(p => p.map(x => x.id === res.id ? res : x));
      }
      setModal(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce produit ?')) return;
    await api.delete(`/admin/products/${id}`);
    setProducts(p => p.filter(x => x.id !== id));
  }

  async function handleToggle(p: Product) {
    await api.patch(`/admin/products/${p.id}/toggle`);
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'available' ? 'unavailable' : 'available' } : x));
  }

  const fieldCls = "w-full bg-white border border-[#E5E9F0] rounded-xl px-4 py-2.5 text-[#0A1628] focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8] text-sm";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] mb-1">Produits</h1>
          <p className="text-[#69727F]">{products.length} produit{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Nouveau produit
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-[#69727F]"><div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />Chargement...</div>
      ) : (
        <div className="cyna-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E9F0] bg-[#F6F8FB]">
                  {['Produit', 'Catégorie', 'Prix/mois', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs text-[#69727F] font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-[#E5E9F0] last:border-0 hover:bg-[#F6F8FB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-[#0A1628] font-semibold text-sm">{p.name}</div>
                      <div className="text-[#9AA3AF] text-xs mt-0.5 truncate max-w-xs">{p.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${p.category_color ?? '#00B4D8'}18`, color: p.category_color ?? '#00B4D8', border: `1px solid ${p.category_color ?? '#00B4D8'}35` }}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#0A1628] font-semibold text-sm">{p.price_monthly?.toLocaleString('fr-FR')}€</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'available' ? 'bg-[#10B981]/12 text-[#059669] border border-[#10B981]/30' : 'bg-[#EDF1F7] text-[#69727F] border border-[#E5E9F0]'}`}>
                        {p.status === 'available' ? 'Disponible' : 'Indisponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(p)} title="Basculer disponibilité"
                          className="p-1.5 hover:bg-[#F6F8FB] rounded-lg transition-colors text-[#9AA3AF] hover:text-[#0A1628]">
                          {p.status === 'available' ? <ToggleRight className="w-5 h-5 text-[#10B981]" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 hover:bg-[#F6F8FB] rounded-lg transition-colors text-[#9AA3AF] hover:text-[#00B4D8]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors text-[#9AA3AF] hover:text-[#EF4444]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal création/édition */}
      {modal && (
        <div className="fixed inset-0 bg-[#0A1628]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E9F0] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E9F0]">
              <h2 className="text-xl font-bold text-[#0A1628]">{modal === 'create' ? 'Nouveau produit' : 'Modifier le produit'}</h2>
              <button onClick={() => setModal(null)} className="text-[#9AA3AF] hover:text-[#0A1628]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[#0A1628] text-sm font-semibold mb-1">Nom</label>
                <input type="text" value={current.name} onChange={e => setCurrent((c: any) => ({ ...c, name: e.target.value }))} className={fieldCls} />
              </div>
              <div>
                <label className="block text-[#0A1628] text-sm font-semibold mb-1">Catégorie</label>
                <select value={current.category_id} onChange={e => setCurrent((c: any) => ({ ...c, category_id: Number(e.target.value) }))} className={fieldCls}>
                  <option value={0}>-- Choisir --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[#0A1628] text-sm font-semibold mb-1">Description</label>
                <textarea rows={3} value={current.description} onChange={e => setCurrent((c: any) => ({ ...c, description: e.target.value }))} className={`${fieldCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#0A1628] text-sm font-semibold mb-1">Prix mensuel (€)</label>
                  <input type="number" value={current.price_monthly} onChange={e => setCurrent((c: any) => ({ ...c, price_monthly: Number(e.target.value) }))} className={fieldCls} />
                </div>
                <div>
                  <label className="block text-[#0A1628] text-sm font-semibold mb-1">Prix annuel (€)</label>
                  <input type="number" value={current.price_annual} onChange={e => setCurrent((c: any) => ({ ...c, price_annual: Number(e.target.value) }))} className={fieldCls} />
                </div>
              </div>
              <div>
                <label className="block text-[#0A1628] text-sm font-semibold mb-1">Fonctionnalités (une par ligne)</label>
                <textarea rows={4} value={featuresInput} onChange={e => setFeaturesInput(e.target.value)}
                  placeholder="Surveillance 24/7&#10;Détection IA&#10;Conformité ISO 27001"
                  className={`${fieldCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#0A1628] text-sm font-semibold mb-1">Statut</label>
                  <select value={current.status} onChange={e => setCurrent((c: any) => ({ ...c, status: e.target.value }))} className={fieldCls}>
                    <option value="available">Disponible</option>
                    <option value="unavailable">Indisponible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0A1628] text-sm font-semibold mb-1">Priorité</label>
                  <input type="number" value={current.priority} onChange={e => setCurrent((c: any) => ({ ...c, priority: Number(e.target.value) }))} className={fieldCls} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#E5E9F0]">
              <button onClick={() => setModal(null)} className="btn btn-ghost flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
                {saving ? 'Enregistrement...' : <><Check className="w-4 h-4" />Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
