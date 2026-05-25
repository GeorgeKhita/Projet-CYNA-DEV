import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CreditCard, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { getMyOrders, type Order } from '../api/orders';
import { useAuthStore } from '../store/authStore';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setError('Impossible de charger vos commandes.'))
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status === 'paid');
  const totalMonthly = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const nextRenewal = activeOrders.length > 0
    ? new Date(new Date(activeOrders[0].created_at).setMonth(new Date(activeOrders[0].created_at).getMonth() + 1))
        .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : '—';

  const stats = [
    { label: 'Abonnements actifs', value: activeOrders.length.toString(), icon: CheckCircle },
    { label: 'Factures ce mois',   value: totalMonthly > 0 ? `${totalMonthly.toLocaleString('fr-FR')}€` : '—', icon: CreditCard },
    { label: 'Prochain renouvellement', value: nextRenewal, icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <DashboardSidebar active="overview" />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Vue d'ensemble</h1>
              <p className="text-gray-400">
                Bonjour {user?.firstName} 👋 — Gérez vos abonnements et suivez votre activité
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat) => {
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

            {/* Commandes actives */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Abonnements actifs</h2>

              {loading && (
                <div className="flex items-center gap-3 text-gray-400 py-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">{error}</span>
                </div>
              )}

              {!loading && !error && activeOrders.length === 0 && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-gray-400 mb-4">Aucun abonnement actif pour le moment.</p>
                  <Link to="/catalogue" className="px-6 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
                    Découvrir nos solutions
                  </Link>
                </div>
              )}

              {!loading && activeOrders.map((order) => (
                <div key={order.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {order.items.map((i) => i.product_name).join(', ') || `Commande #${order.id}`}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full text-xs font-semibold">
                          Actif
                        </span>
                        <span className="text-gray-400 text-sm">
                          {order.items[0]?.plan === 'annual' ? 'Facturation annuelle' : 'Facturation mensuelle'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right mr-6">
                      <div className="text-2xl font-bold text-[#00B4D8] mb-1">
                        {order.total.toLocaleString('fr-FR')}€
                      </div>
                      <div className="text-sm text-gray-400">
                        /{order.items[0]?.plan === 'annual' ? 'an' : 'mois'}
                      </div>
                    </div>
                    <Link
                      to="/espace-client/commandes"
                      className="px-6 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
