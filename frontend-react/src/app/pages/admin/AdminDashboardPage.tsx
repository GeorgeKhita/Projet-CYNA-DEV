import { useState, useEffect } from 'react';
import { Users, ShoppingCart, TrendingUp, MessageSquare, Package } from 'lucide-react';
import { api } from '../../../api/client';
import { Link } from 'react-router';

interface KPIs {
  total_revenue: number;
  active_clients: number;
  active_contracts: number;
  open_tickets: number;
  revenue_trend: number;
}

interface RecentOrder {
  id: number;
  ref: string;
  client: string;
  amount: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#10B981', pending: '#F59E0B', failed: '#EF4444', refunded: '#8B5CF6',
};
const STATUS_LABELS: Record<string, string> = {
  paid: 'Payée', pending: 'En attente', failed: 'Échouée', refunded: 'Remboursée',
};

export function AdminDashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/admin/dashboard')
      .then(data => {
        setKpis(data.kpis);
        setOrders(data.recent_orders ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = kpis ? [
    { label: 'Chiffre d\'affaires total', value: `${kpis.total_revenue.toLocaleString('fr-FR')}€`, icon: TrendingUp, color: '#00B4D8', trend: kpis.revenue_trend },
    { label: 'Clients actifs',            value: String(kpis.active_clients),                       icon: Users,       color: '#8B5CF6' },
    { label: 'Contrats actifs',           value: String(kpis.active_contracts),                     icon: Package,     color: '#10B981' },
    { label: 'Tickets ouverts',           value: String(kpis.open_tickets),                         icon: MessageSquare, color: '#F59E0B' },
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400">Vue d'ensemble de la plateforme CYNA</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
          Chargement...
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {stats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}30` }}>
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    {stat.trend !== undefined && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend >= 0 ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-red-500/20 text-red-400'}`}>
                        {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Commandes récentes */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#00B4D8]" /> Commandes récentes
              </h2>
              <Link to="/admin/commandes" className="text-[#00B4D8] hover:underline text-sm">Voir tout →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Référence', 'Client', 'Montant', 'Statut', 'Date'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucune commande</td></tr>
                  ) : orders.map(order => {
                    const color = STATUS_COLORS[order.status] ?? '#9CA3AF';
                    return (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-[#00B4D8] font-mono text-sm">{order.ref}</td>
                        <td className="px-6 py-4 text-white text-sm">{order.client}</td>
                        <td className="px-6 py-4 text-white font-semibold text-sm">{order.amount?.toLocaleString('fr-FR')}€</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
