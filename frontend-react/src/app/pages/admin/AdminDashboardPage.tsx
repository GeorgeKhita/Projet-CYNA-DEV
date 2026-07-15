import { useState, useEffect, useCallback } from 'react';
import { Users, ShoppingCart, TrendingUp, MessageSquare, Package, BarChart2 } from 'lucide-react';
import { api } from '../../../api/client';
import { Link } from 'react-router';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

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

interface SaleSlot {
  label: string;
  total: number;
  [category: string]: number | string;
}

interface CategoryTotal {
  name: string;
  value: number;
}

interface ChartData {
  period: string;
  categories: string[];
  sales: SaleSlot[];
  category_totals: CategoryTotal[];
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#10B981', pending: '#F59E0B', failed: '#EF4444', refunded: '#7C5CFC',
};
const STATUS_LABELS: Record<string, string> = {
  paid: 'Payée', pending: 'En attente', failed: 'Échouée', refunded: 'Remboursée',
};

const CATEGORY_COLORS: Record<string, string> = {
  SOC:   '#00B4D8',
  EDR:   '#7C5CFC',
  XDR:   '#10B981',
  Autre: '#F59E0B',
};
const FALLBACK_COLORS = ['#00B4D8', '#7C5CFC', '#10B981', '#F59E0B', '#EF4444', '#F97316'];

function getCategoryColor(name: string, index: number, dynamicColors: Record<string, string> = {}): string {
  return dynamicColors[name] ?? CATEGORY_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  color: 'var(--color-ink)',
};

export function AdminDashboardPage() {
  const [kpis, setKpis]                 = useState<KPIs | null>(null);
  const [orders, setOrders]             = useState<RecentOrder[]>([]);
  const [loading, setLoading]           = useState(true);
  const [chartData, setChartData]       = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [period, setPeriod]             = useState<'daily' | 'weekly'>('daily');
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<any>('/admin/dashboard')
      .then(data => {
        setKpis(data.kpis);
        setOrders(data.recent_orders ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get<{ name: string; color: string }[]>('/categories')
      .then(cats => setCategoryColors(Object.fromEntries(cats.map(c => [c.name, c.color]))))
      .catch(() => {});
  }, []);

  const fetchChart = useCallback((p: 'daily' | 'weekly') => {
    setChartLoading(true);
    api.get<ChartData>(`/admin/dashboard/revenue-chart?period=${p}`)
      .then(data => setChartData(data))
      .catch(() => {})
      .finally(() => setChartLoading(false));
  }, []);

  useEffect(() => { fetchChart(period); }, [period, fetchChart]);

  const stats = kpis ? [
    { label: 'Chiffre d\'affaires total', value: `${kpis.total_revenue.toLocaleString('fr-FR')}€`, icon: TrendingUp,   color: '#00B4D8', trend: kpis.revenue_trend },
    { label: 'Clients actifs',            value: String(kpis.active_clients),                       icon: Users,         color: '#7C5CFC' },
    { label: 'Contrats actifs',           value: String(kpis.active_contracts),                     icon: Package,       color: '#10B981' },
    { label: 'Tickets ouverts',           value: String(kpis.open_tickets),                         icon: MessageSquare, color: '#F59E0B' },
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de la plateforme CYNA</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground">
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
                <div key={stat.label} className="cyna-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    {stat.trend !== undefined && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend >= 0 ? 'bg-[#10B981]/12 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-ink mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* ── Graphiques des ventes ── */}
          <div className="cyna-card mb-8">
            {/* En-tête + toggle période */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#00B4D8]" /> Tableau de bord des ventes
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('daily')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    period === 'daily'
                      ? 'bg-[#00B4D8] text-[#06222C]'
                      : 'bg-bg-subtle text-muted-foreground hover:text-ink'
                  }`}
                >
                  7 derniers jours
                </button>
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    period === 'weekly'
                      ? 'bg-[#00B4D8] text-[#06222C]'
                      : 'bg-bg-subtle text-muted-foreground hover:text-ink'
                  }`}
                >
                  5 dernières semaines
                </button>
              </div>
            </div>

            {chartLoading ? (
              <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                Chargement des graphiques...
              </div>
            ) : chartData && (
              <div className="p-6 space-y-8">

                {/* 1. Histogramme total des ventes par jour / semaine */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Ventes {period === 'daily' ? 'par jour' : 'par semaine'}
                  </h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData.sales} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false}
                        tickFormatter={v => `${v}€`} width={60} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v.toLocaleString('fr-FR')}€`, 'Ventes']} />
                      <Bar dataKey="total" name="Ventes totales" fill="#00B4D8" radius={[6, 6, 0, 0]} maxBarSize={52} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="border-t border-border" />

                {/* 2 + 3 — Histogramme multi-couches (gauche) + Camembert (droite) */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                  {/* 2. Histogramme empilé par catégorie */}
                  <div className="xl:col-span-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Paniers moyens par catégorie
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={chartData.sales} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false}
                          tickFormatter={v => `${v}€`} width={60} />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(v: number, name: string) => [`${v.toLocaleString('fr-FR')}€`, name]}
                        />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                        {chartData.categories.length > 0 ? chartData.categories.map((cat, idx) => (
                          <Bar
                            key={cat}
                            dataKey={cat}
                            name={cat}
                            stackId="categories"
                            fill={getCategoryColor(cat, idx, categoryColors)}
                            radius={idx === chartData.categories.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                            maxBarSize={52}
                          />
                        )) : (
                          <Bar dataKey="total" name="Ventes" fill="#00B4D8" radius={[6, 6, 0, 0]} maxBarSize={52} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 3. Camembert — répartition par catégorie */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Répartition par catégorie
                    </h3>
                    {chartData.category_totals.length === 0 || chartData.category_totals.every(c => c.value === 0) ? (
                      <div className="flex flex-col items-center justify-center h-[240px] gap-3">
                        <div className="w-28 h-28 rounded-full border-[12px] border-border opacity-30" />
                        <span className="text-muted-foreground text-sm">Aucune vente sur la période</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={chartData.category_totals}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="42%"
                            outerRadius={85}
                            innerRadius={48}
                            paddingAngle={3}
                            label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                            labelLine={false}
                          >
                            {chartData.category_totals.map((entry, idx) => (
                              <Cell key={entry.name} fill={getCategoryColor(entry.name, idx, categoryColors)} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const name  = payload[0].name as string;
                              const value = payload[0].value as number;
                              const idx   = chartData.category_totals.findIndex(c => c.name === name);
                              const color = getCategoryColor(name, idx, categoryColors);
                              return (
                                <div style={{ ...TOOLTIP_STYLE, padding: '8px 12px' }}>
                                  <p style={{ margin: 0, color, fontWeight: 600 }}>{name}</p>
                                  <p style={{ margin: 0, color, fontWeight: 700 }}>{value.toLocaleString('fr-FR')}€</p>
                                </div>
                              );
                            }}
                          />
                          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Commandes récentes */}
          <div className="cyna-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#00B4D8]" /> Commandes récentes
              </h2>
              <Link to="/admin/commandes" className="text-primary hover:underline text-sm font-semibold">Voir tout →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-subtle">
                    {['Référence', 'Client', 'Montant', 'Statut', 'Date'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Aucune commande</td></tr>
                  ) : orders.map(order => {
                    const color = STATUS_COLORS[order.status] ?? '#9AA3AF';
                    return (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-bg-subtle transition-colors">
                        <td className="px-6 py-4 text-primary font-mono text-sm">{order.ref}</td>
                        <td className="px-6 py-4 text-ink text-sm">{order.client}</td>
                        <td className="px-6 py-4 text-ink font-semibold text-sm">{order.amount?.toLocaleString('fr-FR')}€</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
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
