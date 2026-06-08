import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { CATEGORY_COLORS } from '../../lib/cart';

interface Subscription {
  id: number;
  product?: { name: string; category?: string; category_color?: string };
  status: string;
  price: number;
  billing_cycle?: string;
  current_period_end?: string;
}

export function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<any>('/subscriptions')
      .then(data => setSubscriptions(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setSubscriptions([]))
      .finally(() => setDataLoading(false));
  }, [isAuthenticated]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const nextRenewal = activeSubs.map(s => s.current_period_end).filter(Boolean).sort()[0];

  const stats = [
    { label: 'Abonnements actifs',    value: String(activeSubs.length), icon: CheckCircle },
    { label: 'Total mensuel',          value: monthlyTotal > 0 ? `${monthlyTotal.toLocaleString('fr-FR')}€` : '—', icon: CreditCard },
    { label: 'Prochain renouvellement',value: nextRenewal ? new Date(nextRenewal).toLocaleDateString('fr-FR') : '—', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Vue d'ensemble</h1>
              <p className="text-gray-400">Bonjour {user?.first_name}, gérez vos abonnements et votre activité</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
                    <div className="w-12 h-12 bg-[#00B4D8]/20 border border-[#00B4D8]/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#00B4D8]" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Abonnements actifs</h2>
                <Link to="/espace-client/abonnements" className="text-[#00B4D8] hover:underline text-sm">Voir tout →</Link>
              </div>

              {dataLoading ? (
                <div className="flex items-center gap-3 text-gray-400 py-8">
                  <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </div>
              ) : activeSubs.length === 0 ? (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-gray-400 mb-4">Aucun abonnement actif pour le moment.</p>
                  <Link to="/catalogue" className="px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
                    Découvrir nos solutions
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSubs.slice(0, 3).map(sub => {
                    const color = sub.product?.category_color ?? CATEGORY_COLORS[sub.product?.category ?? ''] ?? '#00B4D8';
                    return (
                      <div key={sub.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{sub.product?.name ?? `Abonnement #${sub.id}`}</h3>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full text-xs font-semibold">Actif</span>
                              <span className="text-gray-400 text-sm">Facturation {sub.billing_cycle === 'annual' ? 'annuelle' : 'mensuelle'}</span>
                            </div>
                          </div>
                          <div className="text-right mr-6">
                            <div className="text-2xl font-bold text-[#00B4D8] mb-1">{sub.price?.toLocaleString('fr-FR')}€</div>
                            <div className="text-sm text-gray-400">/mois</div>
                          </div>
                          <Link to="/espace-client/abonnements"
                            className="px-6 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
                            Gérer
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
