import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { ShoppingBag, Calendar, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { CATEGORY_COLORS } from '../../lib/cart';

interface Subscription {
  id: number;
  status: string;
  billing_cycle: string;
  price: number;
  current_period_end: string;
  product?: { id: number; name: string; category: string; category_color: string };
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  active:    { label: 'Actif',     badgeClass: 'bg-[#10B981]/12 text-success border-[#10B981]/30' },
  cancelled: { label: 'Annulé',   badgeClass: 'bg-bg-muted text-muted-foreground border-border' },
  expired:   { label: 'Expiré',   badgeClass: 'bg-[#F59E0B]/12 text-[#B45309] border-[#F59E0B]/30' },
  past_due:  { label: 'Impayé',   badgeClass: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const RENEWABLE_STATUSES = ['cancelled', 'expired', 'past_due'];

export function AbonnementsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading]       = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [renewing, setRenewing]     = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<Subscription[]>('/subscriptions')
      .then(data => setSubs(Array.isArray(data) ? data : []))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function handleCancel(id: number) {
    if (!confirm('Confirmer l\'annulation de cet abonnement ?')) return;
    setCancelling(id);
    try {
      await api.patch(`/subscriptions/${id}/cancel`);
      setSubs(s => s.map(sub => sub.id === id ? { ...sub, status: 'cancelled' } : sub));
    } catch {
      alert('Erreur lors de l\'annulation.');
    } finally {
      setCancelling(null);
    }
  }

  async function handleRenew(id: number) {
    if (!confirm('Confirmer le renouvellement de cet abonnement ?')) return;
    setRenewing(id);
    try {
      const updated = await api.patch<Subscription>(`/subscriptions/${id}/renew`);
      setSubs(s => s.map(sub => sub.id === id ? { ...sub, ...updated } : sub));
    } catch {
      alert('Erreur lors du renouvellement.');
    } finally {
      setRenewing(null);
    }
  }

  if (authLoading) return <div className="min-h-screen bg-card flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  const active    = subs.filter(s => s.status === 'active');
  const inactive  = subs.filter(s => s.status !== 'active');

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-ink mb-2">Mes abonnements</h1>
              <p className="text-muted-foreground">{active.length} abonnement{active.length !== 1 ? 's' : ''} actif{active.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground py-8">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                Chargement...
              </div>
            ) : active.length === 0 && inactive.length === 0 ? (
              <div className="text-center py-16 cyna-card">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-6">Aucun abonnement pour le moment.</p>
              </div>
            ) : (
              <>
                {active.length > 0 && (
                  <div className="space-y-4">
                    {active.map(sub => {
                      const color = sub.product?.category_color ?? CATEGORY_COLORS[sub.product?.category ?? ''] ?? '#00B4D8';
                      return (
                        <div key={sub.id} className="cyna-card cyna-card-hover p-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-xl font-bold text-ink">{sub.product?.name ?? `Abonnement #${sub.id}`}</h3>
                                <span className="chip" style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}>
                                  {sub.product?.category}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#10B981]/12 text-success border-[#10B981]/30">Actif</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <span>Facturation {sub.billing_cycle === 'annual' ? 'annuelle' : 'mensuelle'}</span>
                                {sub.current_period_end && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Renouvellement : {new Date(sub.current_period_end).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-ink">{sub.price?.toLocaleString('fr-FR')}€</div>
                                <div className="text-sm text-muted-foreground">/mois HT</div>
                              </div>
                              <button
                                onClick={() => alert('Pour modifier votre abonnement, contactez notre équipe commerciale.')}
                                className="btn btn-outline btn-sm flex items-center gap-1.5"
                                title="Modifier l'abonnement">
                                <Settings className="w-4 h-4" /> Modifier
                              </button>
                              <button onClick={() => handleCancel(sub.id)} disabled={cancelling === sub.id} className="btn btn-danger btn-sm">
                                {cancelling === sub.id ? 'Annulation...' : 'Annuler'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {inactive.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Abonnements inactifs
                    </h2>
                    <div className="space-y-3">
                      {inactive.map(sub => {
                        const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.cancelled;
                        const canRenew = RENEWABLE_STATUSES.includes(sub.status);
                        return (
                          <div key={sub.id} className="bg-bg-subtle border border-border rounded-2xl p-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                              <div>
                                <span className="text-ink font-semibold">{sub.product?.name ?? `Abonnement #${sub.id}`}</span>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Facturation {sub.billing_cycle === 'annual' ? 'annuelle' : 'mensuelle'} — {sub.price?.toLocaleString('fr-FR')}€ HT/mois
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}>{cfg.label}</span>
                                {canRenew && (
                                  <button
                                    onClick={() => handleRenew(sub.id)}
                                    disabled={renewing === sub.id}
                                    className="btn btn-primary btn-sm flex items-center gap-1.5">
                                    <RefreshCw className={`w-3.5 h-3.5 ${renewing === sub.id ? 'animate-spin' : ''}`} />
                                    {renewing === sub.id ? 'Renouvellement...' : 'Renouveler'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
