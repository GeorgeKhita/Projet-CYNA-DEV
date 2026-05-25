import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 24500 },
  { month: 'Fév', revenue: 31200 },
  { month: 'Mar', revenue: 28900 },
  { month: 'Avr', revenue: 38700 },
  { month: 'Mai', revenue: 42100 },
  { month: 'Juin', revenue: 39800 },
  { month: 'Juil', revenue: 51200 },
];

const categoryData = [
  { name: 'SOC', value: 38, color: '#00B4D8' },
  { name: 'EDR', value: 35, color: '#8B5CF6' },
  { name: 'XDR', value: 27, color: '#10B981' },
];

const recentOrders = [
  { id: 'CYN-2026-0051', client: 'TechCorp SA', product: 'Cyna SOC Premium', amount: '1 299€', status: 'Actif' },
  { id: 'CYN-2026-0050', client: 'InfoSec Ltd', product: 'Cyna EDR Enterprise', amount: '899€', status: 'Actif' },
  { id: 'CYN-2026-0049', client: 'DataShield FR', product: 'Cyna XDR Suite', amount: '1 799€', status: 'En attente' },
  { id: 'CYN-2026-0048', client: 'SecurePME', product: 'Cyna SOC Essentials', amount: '699€', status: 'Actif' },
  { id: 'CYN-2026-0047', client: 'GlobalSec', product: 'Cyna XDR Enterprise', amount: '2 499€', status: 'Actif' },
];

const logs = [
  { time: '14:32', action: 'Produit modifié', user: 'admin', detail: 'Cyna SOC Premium — prix mis à jour' },
  { time: '13:15', action: 'Nouvelle commande', user: 'système', detail: 'CYN-2026-0051 — TechCorp SA' },
  { time: '11:48', action: 'Connexion admin', user: 'admin', detail: 'IP: 82.65.4.12' },
  { time: '10:22', action: 'Utilisateur créé', user: 'admin', detail: 'jean.dupont@techcorp.fr' },
];

export function AdminDashboardPage() {
  const kpis = [
    { label: 'Revenus mensuels', value: '51 200€', change: '+21.7%', icon: DollarSign, color: '#10B981' },
    { label: 'Abonnements actifs', value: '247', change: '+14', icon: ShoppingBag, color: '#00B4D8' },
    { label: 'Clients', value: '189', change: '+8', icon: Users, color: '#8B5CF6' },
    { label: 'Uptime API', value: '99.97%', change: 'SLA ✓', icon: TrendingUp, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400">Vue d'ensemble — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}20`, border: `1px solid ${kpi.color}40` }}
                >
                  <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
                <span className="text-[#10B981] text-sm font-semibold bg-[#10B981]/10 px-2 py-1 rounded-full">
                  {kpi.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-400">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Revenus mensuels</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6B7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F1F3A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#00B4D8' }}
                formatter={(v: number) => [`${v.toLocaleString('fr-FR')}€`, 'Revenus']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00B4D8"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Répartition par catégorie</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0F1F3A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={(v: number) => [`${v}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-400">{cat.name}</span>
                </div>
                <span className="text-white font-semibold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Dernières commandes</h2>
            <a href="/admin/commandes" className="text-[#00B4D8] text-sm hover:underline">Voir tout</a>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{order.client}</div>
                  <div className="text-gray-500 text-xs truncate">{order.product}</div>
                </div>
                <div className="text-[#00B4D8] font-semibold text-sm">{order.amount}</div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    order.status === 'Actif'
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                      : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              Logs d'actions récentes
            </h2>
            <a href="/admin/logs" className="text-[#00B4D8] text-sm hover:underline">Voir tout</a>
          </div>
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="text-gray-500 text-xs w-10 flex-shrink-0 pt-0.5">{log.time}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                    <span className="text-white text-sm font-medium">{log.action}</span>
                    <span className="text-gray-500 text-xs">par {log.user}</span>
                  </div>
                  <div className="text-gray-400 text-xs truncate">{log.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
