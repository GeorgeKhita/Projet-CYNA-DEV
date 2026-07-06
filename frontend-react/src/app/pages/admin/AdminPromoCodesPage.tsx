import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../../api/client';

interface PromoCode {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_ht: number | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const EMPTY = {
  code: '',
  type: 'percent' as 'percent' | 'fixed',
  value: 10,
  min_order_ht: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
};

export function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [current, setCurrent] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<PromoCode[]>('/admin/promo-codes')
      .then(d => setPromos(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setCurrent({ ...EMPTY });
    setModal('create');
  }

  function openEdit(p: PromoCode) {
    setCurrent({
      ...p,
      min_order_ht: p.min_order_ht ?? '',
      max_uses: p.max_uses ?? '',
      expires_at: p.expires_at ?? '',
    });
    setModal('edit');
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: any = {
        code: current.code,
        type: current.type,
        value: Number(current.value),
        is_active: current.is_active,
        min_order_ht: current.min_order_ht !== '' ? Number(current.min_order_ht) : null,
        max_uses: current.max_uses !== '' ? Number(current.max_uses) : null,
        expires_at: current.expires_at || null,
      };

      if (modal === 'create') {
        const res = await api.post<PromoCode>('/admin/promo-codes', payload);
        setPromos(p => [res, ...p]);
      } else {
        const res = await api.put<PromoCode>(`/admin/promo-codes/${current.id}`, payload);
        setPromos(p => p.map(x => x.id === res.id ? res : x));
      }
      setModal(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce code promo ?')) return;
    await api.delete(`/admin/promo-codes/${id}`);
    setPromos(p => p.filter(x => x.id !== id));
  }

  async function handleToggle(p: PromoCode) {
    const res = await api.put<PromoCode>(`/admin/promo-codes/${p.id}`, { is_active: !p.is_active });
    setPromos(prev => prev.map(x => x.id === p.id ? res : x));
  }

  const fieldCls = "w-full bg-card border border-border rounded-xl px-4 py-2.5 text-ink focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8] text-sm";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-1">Codes promo</h1>
          <p className="text-muted-foreground">{promos.length} code{promos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Nouveau code
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
          Chargement...
        </div>
      ) : promos.length === 0 ? (
        <div className="cyna-card p-12 text-center text-muted-foreground">
          Aucun code promo. Créez-en un !
        </div>
      ) : (
        <div className="cyna-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-subtle">
                  {['Code', 'Réduction', 'Min commande', 'Utilisations', 'Expire le', 'Actif', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg-subtle transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-ink text-sm bg-bg-subtle border border-border rounded-lg px-2.5 py-1">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink font-semibold text-sm">
                      {p.type === 'percent' ? `-${p.value}%` : `-${p.value.toFixed(2)}€`}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {p.min_order_ht ? `${p.min_order_ht}€ HT` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {p.uses_count}{p.max_uses ? ` / ${p.max_uses}` : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {p.expires_at ? new Date(p.expires_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggle(p)} title="Basculer" aria-label={`Basculer l'activation du code ${p.code}`}>
                        {p.is_active
                          ? <ToggleRight className="w-6 h-6 text-[#10B981]" />
                          : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} aria-label={`Modifier le code ${p.code}`}
                          className="p-1.5 hover:bg-bg-subtle rounded-lg transition-colors text-muted-foreground hover:text-[#00B4D8]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} aria-label={`Supprimer le code ${p.code}`}
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

      {modal && (
        <div className="fixed inset-0 bg-[#0A1628]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-ink">
                {modal === 'create' ? 'Nouveau code promo' : 'Modifier le code promo'}
              </h2>
              <button onClick={() => setModal(null)} aria-label="Fermer" className="text-muted-foreground hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="promo-code" className="block text-ink text-sm font-semibold mb-1">Code</label>
                <input
                  id="promo-code"
                  type="text"
                  value={current.code}
                  onChange={e => setCurrent((c: any) => ({ ...c, code: e.target.value.toUpperCase() }))}
                  placeholder="EX: BIENVENUE10"
                  className={fieldCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="promo-type" className="block text-ink text-sm font-semibold mb-1">Type</label>
                  <select
                    id="promo-type"
                    value={current.type}
                    onChange={e => setCurrent((c: any) => ({ ...c, type: e.target.value }))}
                    className={fieldCls}
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="promo-value" className="block text-ink text-sm font-semibold mb-1">
                    Valeur {current.type === 'percent' ? '(%)' : '(€)'}
                  </label>
                  <input
                    id="promo-value"
                    type="number"
                    min="0"
                    step={current.type === 'percent' ? '1' : '0.01'}
                    value={current.value}
                    onChange={e => setCurrent((c: any) => ({ ...c, value: e.target.value }))}
                    className={fieldCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="promo-min-order" className="block text-ink text-sm font-semibold mb-1">Min commande HT (€)</label>
                  <input
                    id="promo-min-order"
                    type="number"
                    min="0"
                    step="0.01"
                    value={current.min_order_ht}
                    onChange={e => setCurrent((c: any) => ({ ...c, min_order_ht: e.target.value }))}
                    placeholder="Optionnel"
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label htmlFor="promo-max-uses" className="block text-ink text-sm font-semibold mb-1">Nb utilisations max</label>
                  <input
                    id="promo-max-uses"
                    type="number"
                    min="1"
                    value={current.max_uses}
                    onChange={e => setCurrent((c: any) => ({ ...c, max_uses: e.target.value }))}
                    placeholder="Illimité"
                    className={fieldCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="promo-expires-at" className="block text-ink text-sm font-semibold mb-1">Date d'expiration</label>
                <input
                  id="promo-expires-at"
                  type="date"
                  value={current.expires_at}
                  onChange={e => setCurrent((c: any) => ({ ...c, expires_at: e.target.value }))}
                  className={fieldCls}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={current.is_active}
                  onChange={e => setCurrent((c: any) => ({ ...c, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-border-strong text-[#00B4D8]"
                />
                <label htmlFor="is_active" className="text-ink text-sm font-semibold cursor-pointer">
                  Actif
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
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
