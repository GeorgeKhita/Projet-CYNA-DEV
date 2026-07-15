import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../../../api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

interface Category {
  id: number;
  name: string;
  color: string;
  description: string | null;
  image: string | null;
  display_order: number;
  products_count: number;
}

const EMPTY: Omit<Category, 'id' | 'products_count'> = {
  name: '', color: '#00B4D8', description: '', image: '', display_order: 0,
};

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [current, setCurrent] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api.get<Category[]>('/admin/categories').then(d => setCategories(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }

  function openCreate() {
    setCurrent({ ...EMPTY });
    setModal('create');
  }

  function openEdit(c: Category) {
    setCurrent({ ...c });
    setModal('edit');
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...current, image: current.image || null };
      if (modal === 'create') {
        const res = await api.post<Category>('/admin/categories', payload);
        setCategories(c => [...c, res]);
      } else {
        const res = await api.put<Category>(`/admin/categories/${current.id}`, payload);
        setCategories(c => c.map(x => x.id === res.id ? res : x));
      }
      setModal(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(c => c.filter(x => x.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setCategories(reordered);
    await api.post('/admin/categories/reorder', { order: reordered.map(c => c.id) });
    load();
  }

  const fieldCls = "w-full bg-card border border-border rounded-xl px-4 py-2.5 text-ink focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8] text-sm";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-1">Catégories</h1>
          <p className="text-muted-foreground">{categories.length} catégorie{categories.length !== 1 ? 's' : ''} — l'ordre ci-dessous est celui affiché sur la page d'accueil</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Nouvelle catégorie
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground"><div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />Chargement...</div>
      ) : (
        <div className="cyna-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-subtle">
                  {['Ordre', 'Catégorie', 'Description', 'Produits', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Aucune catégorie</td></tr>
                ) : categories.map((c, idx) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg-subtle transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => move(idx, -1)} disabled={idx === 0} aria-label={`Monter ${c.name}`}
                          className="p-1 hover:bg-bg-subtle rounded-lg transition-colors text-muted-foreground hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => move(idx, 1)} disabled={idx === categories.length - 1} aria-label={`Descendre ${c.name}`}
                          className="p-1 hover:bg-bg-subtle rounded-lg transition-colors text-muted-foreground hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${c.color}18`, color: c.color, border: `1px solid ${c.color}35` }}>
                        {c.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm truncate max-w-xs">{c.description}</td>
                    <td className="px-6 py-4 text-ink text-sm">{c.products_count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} aria-label={`Modifier ${c.name}`}
                          className="p-1.5 hover:bg-bg-subtle rounded-lg transition-colors text-muted-foreground hover:text-[#00B4D8]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} aria-label={`Supprimer ${c.name}`}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive">
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
      <Dialog open={!!modal} onOpenChange={open => !open && setModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card p-0 gap-0">
          <DialogHeader className="p-6 border-b border-border text-left">
            <DialogTitle className="text-xl font-bold text-ink">{modal === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="category-name" className="block text-ink text-sm font-semibold mb-1">Nom</label>
              <input id="category-name" type="text" value={current.name} onChange={e => setCurrent((c: any) => ({ ...c, name: e.target.value }))} className={fieldCls} />
            </div>
            <div>
              <label htmlFor="category-description" className="block text-ink text-sm font-semibold mb-1">Description</label>
              <textarea id="category-description" rows={3} value={current.description ?? ''} onChange={e => setCurrent((c: any) => ({ ...c, description: e.target.value }))} className={`${fieldCls} resize-none`} />
            </div>
            <div>
              <label htmlFor="category-image" className="block text-ink text-sm font-semibold mb-1">Image (URL)</label>
              <input id="category-image" type="url" value={current.image ?? ''} onChange={e => setCurrent((c: any) => ({ ...c, image: e.target.value }))}
                placeholder="https://exemple.com/categorie.jpg" className={fieldCls} />
            </div>
            <div>
              <label htmlFor="category-color" className="block text-ink text-sm font-semibold mb-1">Couleur</label>
              <input id="category-color" type="color" value={current.color} onChange={e => setCurrent((c: any) => ({ ...c, color: e.target.value }))}
                className="w-full h-11 bg-card border border-border rounded-xl cursor-pointer" />
            </div>
          </div>
          <DialogFooter className="flex-row gap-3 p-6 border-t border-border sm:justify-stretch">
            <button onClick={() => setModal(null)} className="btn btn-ghost flex-1">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
              {saving ? 'Enregistrement...' : <><Check className="w-4 h-4" />Enregistrer</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
