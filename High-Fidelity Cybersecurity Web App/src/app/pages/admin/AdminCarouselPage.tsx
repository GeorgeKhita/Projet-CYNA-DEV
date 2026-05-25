import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Loader2, AlertCircle } from 'lucide-react';
import { adminGetCarousel, adminCreateSlide, adminUpdateSlide, adminDeleteSlide, type CarouselSlide } from '../../api/admin';

type FormState = Omit<CarouselSlide, 'id'>;
const emptyForm: FormState = { title: '', subtitle: '', image_url: '', cta_text: '', cta_url: '', position: 1, active: true };

export function AdminCarouselPage() {
  const [slides, setSlides]     = useState<CarouselSlide[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<FormState & { id?: number }>(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminGetCarousel()
      .then(setSlides)
      .catch(() => setError('Impossible de charger le carrousel.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ ...emptyForm, position: slides.length + 1 }); setShowForm(true); };
  const openEdit = (s: CarouselSlide) => {
    setForm({ id: s.id, title: s.title, subtitle: s.subtitle ?? '', image_url: s.image_url ?? '', cta_text: s.cta_text ?? '', cta_url: s.cta_url ?? '', position: s.position, active: s.active });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) await adminUpdateSlide(form.id, form);
      else await adminCreateSlide(form);
      setShowForm(false);
      load();
    } catch { alert('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await adminDeleteSlide(id); setDeleteId(null); load(); }
    catch { alert('Erreur lors de la suppression.'); }
  };

  const handleToggle = async (slide: CarouselSlide) => {
    try { await adminUpdateSlide(slide.id, { ...slide, active: !slide.active }); load(); }
    catch { alert('Erreur.'); }
  };

  const sorted = [...slides].sort((a, b) => a.position - b.position);

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Carrousel</h1>
          <p className="text-gray-400">Gérez les slides de la page d'accueil</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
          <Plus className="w-5 h-5" /> Nouvelle slide
        </button>
      </div>

      {loading && <div className="flex items-center gap-3 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin" />Chargement...</div>}
      {error && <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4"><AlertCircle className="w-5 h-5 text-red-400" /><span className="text-red-400">{error}</span></div>}

      {!loading && (
        <div className="space-y-4">
          {sorted.map((slide, idx) => (
            <div key={slide.id} className={`bg-gradient-to-br from-white/5 to-white/[0.02] border rounded-xl p-6 transition-all ${slide.active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1">
                  <button onClick={() => idx > 0 && adminUpdateSlide(slide.id, { ...slide, position: slide.position - 1 }).then(load)}
                    disabled={idx === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-gray-500 text-xs text-center">{slide.position}</span>
                  <button onClick={() => idx < sorted.length - 1 && adminUpdateSlide(slide.id, { ...slide, position: slide.position + 1 }).then(load)}
                    disabled={idx === sorted.length - 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg mb-1">{slide.title}</h3>
                  {slide.subtitle && <p className="text-gray-400 text-sm mb-2">{slide.subtitle}</p>}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {slide.cta_text && (
                      <span className="text-xs text-[#00B4D8] bg-[#00B4D8]/10 px-3 py-1 rounded-full border border-[#00B4D8]/20">
                        CTA : {slide.cta_text}
                      </span>
                    )}
                    {slide.image_url && (
                      <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">🖼 Image</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => handleToggle(slide)} className="text-gray-400 hover:text-white transition-colors">
                    {slide.active ? <ToggleRight className="w-6 h-6 text-[#10B981]" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => openEdit(slide)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(slide.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1F3A] border border-white/10 rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">{form.id ? 'Modifier' : 'Créer'} une slide</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Titre *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Sous-titre</label>
                <textarea value={form.subtitle ?? ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={`${inputCls} resize-none`} rows={2} />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">URL de l'image</label>
                <input value={form.image_url ?? ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Texte du CTA</label>
                  <input value={form.cta_text ?? ''} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className={inputCls} placeholder="Découvrir" />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">URL du CTA</label>
                  <input value={form.cta_url ?? ''} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} className={inputCls} placeholder="/catalogue" />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Position</label>
                <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} min={1} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[#00B4D8]" />
                <span className="text-white text-sm">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-white/10 text-gray-400 hover:text-white rounded-lg font-medium">Annuler</button>
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
            <h3 className="text-2xl font-bold text-white mb-2">Supprimer cette slide ?</h3>
            <p className="text-gray-400 mb-6">Cette action est irréversible.</p>
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
