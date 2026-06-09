import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { ShoppingBag, Calendar, AlertCircle } from 'lucide-react';
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

export function AbonnementsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

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

  if (authLoading) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  const active = subs.filter(s => s.status === 'active');
  const cancelled = subs.filter(s => s.status !== 'active');

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Mes abonnements</h1>
              <p className="text-gray-400">{active.length} abonnement{active.length !== 1 ? 's' : ''} actif{active.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-gray-400 py-8">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                Chargement...
              </div>
            ) : active.length === 0 && cancelled.length === 0 ? (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
                <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">Aucun abonnement pour le moment.</p>
              </div>
            ) : (
              <>
                {active.length > 0 && (
                  <div className="space-y-4">
                    {active.map(sub => {
                      const color = sub.product?.category_color ?? CATEGORY_COLORS[sub.product?.category ?? ''] ?? '#00B4D8';
                      return (
                        <div key={sub.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-xl font-semibold text-white">{sub.product?.name ?? `Abonnement #${sub.id}`}</h3>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                                  {sub.product?.category}
                                </span>
                                <span className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full text-xs font-semibold">Actif</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>Facturation {sub.billing_cycle === 'annual' ? 'annuelle' : 'mensuelle'}</span>
                                {sub.current_period_end && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Renouvellement : {new Date(sub.current_period_end).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-[#00B4D8]">{sub.price?.toLocaleString('fr-FR')}€</div>
                                <div className="text-sm text-gray-400">/mois</div>
                              </div>
                              <button onClick={() => handleCancel(sub.id)} disabled={cancelling === sub.id}
                                className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors disabled:opacity-50">
                                {cancelling === sub.id ? 'Annulation...' : 'Annuler'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {cancelled.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-400 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Abonnements annulés
                    </h2>
                    <div className="space-y-3">
                      {cancelled.map(sub => (
                        <div key={sub.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 opacity-60">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">{sub.product?.name ?? `Abonnement #${sub.id}`}</span>
                            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full text-xs">Annulé</span>
                          </div>
                        </div>
                      ))}
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
