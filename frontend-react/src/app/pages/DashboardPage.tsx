import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { LayoutDashboard, CreditCard, ShoppingBag, Settings, User, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Subscription {
  id: number;
  product?: { name: string; category?: string };
  status: string;
  price: number;
  billing_cycle?: string;
  plan?: string;
  next_billing_date?: string;
  current_period_end?: string;
}

interface Order {
  id: number;
  total: number;
  total_amount?: number;
  status: string;
  created_at: string;
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>('/subscriptions').catch(() => ({ data: [] })),
      api.get<any>('/orders').catch(() => ({ data: [] })),
    ]).then(([subs, ords]) => {
      setSubscriptions(Array.isArray(subs) ? subs : (subs.data ?? []));
      setOrders(Array.isArray(ords) ? ords : (ords.data ?? []));
    }).finally(() => setLoading(false));
  }, []);

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const nextRenewal = activeSubs
    .map(s => s.next_billing_date || s.current_period_end)
    .filter(Boolean)
    .sort()[0];

  const stats = [
    { label: 'Abonnements actifs', value: String(activeSubs.length), icon: CheckCircle },
    { label: 'Factures ce mois', value: monthlyTotal > 0 ? `${monthlyTotal.toLocaleString('fr-FR')}€` : '—', icon: CreditCard },
    { label: 'Prochain renouvellement', value: nextRenewal ? new Date(nextRenewal).toLocaleDateString('fr-FR') : '—', icon: Calendar },
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: '/espace-client', active: true },
    { icon: ShoppingBag, label: 'Abonnements', href: '/espace-client/abonnements', active: false },
    { icon: CreditCard, label: 'Commandes', href: '/espace-client/commandes', active: false },
    { icon: Settings, label: 'Paramètres', href: '/espace-client/parametres', active: false },
  ];

  const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 sticky top-24">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00B4D8] to-[#0096B8] rounded-full flex items-center justify-center mx-auto mb-4">
                  {user ? (
                    <span className="text-white text-2xl font-bold">{initials}</span>
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {user ? `${user.first_name} ${user.last_name}` : 'Mon compte'}
                </h3>
                <p className="text-sm text-gray-400">{user?.email}</p>
                {user?.company && <p className="text-xs text-gray-500 mt-1">{user.company}</p>}
              </div>
              <nav className="space-y-2">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        item.active ? 'bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-4">
                  <span className="font-medium">Se déconnecter</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Vue d'ensemble</h1>
              <p className="text-gray-400">Gérez vos abonnements et suivez votre activité</p>
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
              <h2 className="text-2xl font-bold text-white mb-6">Abonnements actifs</h2>
              {loading ? (
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </div>
              ) : activeSubs.length === 0 ? (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-gray-400 mb-4">Aucun abonnement actif</p>
                  <Link to="/catalogue" className="px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
                    Découvrir nos solutions
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSubs.map(sub => (
                    <div key={sub.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{sub.product?.name ?? `Abonnement #${sub.id}`}</h3>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full text-xs font-semibold">Actif</span>
                            <span className="text-gray-400 text-sm">Facturation {sub.billing_cycle === 'annual' || sub.plan === 'annual' ? 'annuelle' : 'mensuelle'}</span>
                          </div>
                        </div>
                        <div className="text-right mr-6">
                          <div className="text-2xl font-bold text-[#00B4D8] mb-1">{sub.price?.toLocaleString('fr-FR')}€</div>
                          <div className="text-sm text-gray-400">/mois</div>
                        </div>
                        <button className="px-6 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
                          Gérer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
