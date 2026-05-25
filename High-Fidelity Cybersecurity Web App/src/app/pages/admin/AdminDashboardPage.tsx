import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, ShoppingBag, Users, DollarSign, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { adminGetDashboard, adminGetRevenueChart, type DashboardData } from '../../api/admin';

const COLORS = ['#00B4D8', '#8B5CF6', '#10B981'];

export function AdminDashboardPage() {
  const [data, setData]             = useState<DashboardData | null>(null);
  const [revenue, setRevenue]       = useState<{ month: string; revenue: number }[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([adminGetDashboard(), adminGetRevenueChart()])
      .then(([d, r]) => { setData(d); setRevenue(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00B4D8]" />
      </div>
    );
  }

  const kpis = [
    { label: 'Revenus mensuels',    value: data ? `${data.kpis.total_revenue.toLocaleString('fr-FR')}€` : '—', change: `+${data?.kpis.revenue_trend ?? 0}%`, icon: DollarSign, color: '#10B981' },
    { label: 'Abonnements actifs',  value: String(data?.kpis.active_contracts ?? '—'), change: '',  icon: ShoppingBag, color: '#00B4D8' },
    { label: 'Clients actifs',      value: String(data?.kpis.active_clients ?? '—'),   change: '',  icon: Users,       color: '#8B5CF6' },
    { label: 'Tickets ouverts',     value: String(data?.kpis.open_tickets ?? '—'),     change: '',  icon: AlertTriangle, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Vue d'ensemble des performances</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}20`, border: `1px solid ${kpi.color}40` }}>
                  <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
                {kpi.change && (
                  <span className="flex items-center gap-1 text-[#10B981] text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />{kpi.change}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-400">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenus */}
        <div className="xl:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Revenus mensuels</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip contentStyle={{ backgroundColor: '#0F1F3A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} formatter={(v: number) => [`${v.toLocaleString('fr-FR')}€`, 'Revenus']} />
              <Area type="monotone" dataKey="revenue" stroke="#00B4D8" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Catégories */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Répartition catégories</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data?.category_stats ?? []} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                {(data?.category_stats ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(v) => <span style={{ color: '#9CA3AF' }}>{v}</span>} />
              <Tooltip contentStyle={{ backgroundColor: '#0F1F3A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(v: number) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commandes récentes */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Commandes récentes</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Référence', 'Client', 'Produit', 'Montant', 'Statut'].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-gray-400 text-sm font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.recent_orders ?? []).map((order) => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-[#00B4D8] font-semibold text-sm">{order.ref}</td>
                <td className="px-6 py-4 text-white text-sm">{order.client}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">—</td>
                <td className="px-6 py-4 text-white font-semibold text-sm">{order.amount.toLocaleString('fr-FR')}€</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    order.status === 'paid' ? 'text-[#10B981] bg-[#10B981]/20 border-[#10B981]/30' : 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
                  }`}>
                    {order.status === 'paid' ? 'Actif' : 'En attente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logs récents */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Activité récente</h2>
        <div className="space-y-3">
          {(data?.recent_logs ?? []).map((log) => (
            <div key={log.id} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 bg-[#00B4D8]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-[#00B4D8]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">{log.action}</div>
                <div className="text-gray-400 text-xs mt-0.5">{log.detail}</div>
              </div>
              <div className="text-gray-500 text-xs flex-shrink-0">
                {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
