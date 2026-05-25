import { useEffect, useState } from 'react';
import { Shield, Laptop, Globe, Pencil, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, type Category } from '../../api/categories';

const ICONS: Record<string, React.ElementType> = { SOC: Shield, EDR: Laptop, XDR: Globe };
const getIcon = (name: string): React.ElementType => ICONS[name.toUpperCase()] ?? Shield;

type FormState = Omit<Category, 'id' | 'products_count'>;
const emptyForm: FormState = { name: '', description: '', color: '#00B4D8' };

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState<FormState & { id?: number }>(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminGetCategories()
      .then(setCategories)
      .catch(() => setError('Impossible de charger les catégories.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setShowForm(true); };
  const openEdit = (c: Category) => {
    setForm({ id: c.id, name: c.name, description: c.description ?? '', color: c.color });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) await adminUpdateCategory(form.id, form);
      else await adminCreateCategory(form);
      setShowForm(false);
      load();
    } catch { alert('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await adminDeleteCategory(id); setDeleteId(null); load(); }
    catch { alert('Erreur lors de la suppression.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Catégories</h1>
          <p className="text-gray-400">Gérez les catégories de services SaaS</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
          <Plus className="w-5 h-5" /> Nouvelle catégorie
        </button>
      </div>

      {loading && <div className="flex items-center gap-3 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin" />Chargement...</div>}
      {error && <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4"><AlertCircle className="w-5 h-5 text-red-400" /><span className="text-red-400">{error}</span></div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = getIcon(cat.name);
            return (
              <div key={cat.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                    <Icon className="w-7 h-7" style={{ color: cat.color }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(cat.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: cat.color }}>{cat.name}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{cat.description ?? '—'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">{cat.products_count ?? 0} produit(s)</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1F3A] border border-white/10 rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">{form.id ? 'Modifier' : 'Créer'} une catégorie</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Nom</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" placeholder="SOC" />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Couleur</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-white/10" />
                  <span className="text-gray-400 text-sm">{form.color}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-white/10 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1F3A] border border-white/10 rounded-xl p-8 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Supprimer cette catégorie ?</h3>
            <p className="text-gray-400 mb-6">Les produits associés ne seront pas supprimés.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-white/10 text-gray-400 hover:text-white rounded-lg font-medium">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
