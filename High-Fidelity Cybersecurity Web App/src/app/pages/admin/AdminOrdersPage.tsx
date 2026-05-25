import { useState } from 'react';
import { Search, Eye, CheckCircle, Clock, XCircle, Download } from 'lucide-react';

interface Order {
  id: string;
  client: string;
  email: string;
  product: string;
  category: string;
  categoryColor: string;
  amount: number;
  status: 'Actif' | 'En attente' | 'Annulé';
  date: string;
  plan: 'Mensuel' | 'Annuel';
}

const ORDERS: Order[] = [
  { id: 'CYN-2026-0051', client: 'TechCorp SA', email: 'admin@techcorp.fr', product: 'Cyna SOC Premium', category: 'SOC', categoryColor: '#00B4D8', amount: 1299, status: 'Actif', date: '24/05/2026', plan: 'Mensuel' },
  { id: 'CYN-2026-0050', client: 'InfoSec Ltd', email: 'it@infosec.co.uk', product: 'Cyna EDR Enterprise', category: 'EDR', categoryColor: '#8B5CF6', amount: 899, status: 'Actif', date: '22/05/2026', plan: 'Mensuel' },
  { id: 'CYN-2026-0049', client: 'DataShield FR', email: 'contact@datashield.fr', product: 'Cyna XDR Suite', category: 'XDR', categoryColor: '#10B981', amount: 1493, status: 'En attente', date: '21/05/2026', plan: 'Annuel' },
  { id: 'CYN-2026-0048', client: 'SecurePME', email: 'dsi@securepme.fr', product: 'Cyna SOC Essentials', category: 'SOC', categoryColor: '#00B4D8', amount: 699, status: 'Actif', date: '19/05/2026', plan: 'Mensuel' },
  { id: 'CYN-2026-0047', client: 'GlobalSec', email: 'it@globalsec.com', product: 'Cyna XDR Enterprise', category: 'XDR', categoryColor: '#10B981', amount: 2499, status: 'Actif', date: '17/05/2026', plan: 'Mensuel' },
  { id: 'CYN-2026-0046', client: 'CyberGuard', email: 'ops@cyberguard.fr', product: 'Cyna EDR Pro', category: 'EDR', categoryColor: '#8B5CF6', amount: 995, status: 'Annulé', date: '15/05/2026', plan: 'Annuel' },
  { id: 'CYN-2026-0045', client: 'NetProtect', email: 'admin@netprotect.eu', product: 'Cyna SOC Premium', category: 'SOC', categoryColor: '#00B4D8', amount: 1299, status: 'Actif', date: '12/05/2026', plan: 'Mensuel' },
];

const statusConfig = {
  Actif: { icon: CheckCircle, color: '#10B981', bg: '#10B981' },
  'En attente': { icon: Clock, color: '#F59E0B', bg: '#F59E0B' },
  Annulé: { icon: XCircle, color: '#EF4444', bg: '#EF4444' },
};

export function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Actif' | 'En attente' | 'Annulé'>('all');

  const filtered = ORDERS.filter((o) => {
    const matchSearch = o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = ORDERS.filter((o) => o.status === 'Actif').reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Commandes & Abonnements</h1>
          <p className="text-gray-400">{ORDERS.length} commandes — Revenus actifs : <span className="text-[#10B981] font-semibold">{totalRevenue.toLocaleString('fr-FR')}€/mois</span></p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par client, ID, produit..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'Actif', 'En attente', 'Annulé'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                statusFilter === s
                  ? 'bg-[#00B4D8] text-[#0A1628]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {s === 'all' ? 'Tous' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Commande</th>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Client</th>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Produit</th>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Plan</th>
              <th className="text-right px-6 py-4 text-gray-400 text-sm font-medium">Montant</th>
              <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Statut</th>
              <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((order) => {
              const { icon: StatusIcon, color, bg } = statusConfig[order.status];
              return (
                <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-[#00B4D8] font-mono text-sm font-medium">{order.id}</div>
                    <div className="text-gray-500 text-xs">{order.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium text-sm">{order.client}</div>
                    <div className="text-gray-500 text-xs">{order.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ backgroundColor: `${order.categoryColor}20`, color: order.categoryColor, border: `1px solid ${order.categoryColor}40` }}
                      >
                        {order.category}
                      </span>
                      <span className="text-white text-sm">{order.product}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{order.plan}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[#00B4D8] font-bold">{order.amount.toLocaleString('fr-FR')}€</span>
                    <div className="text-gray-500 text-xs">/mois</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${bg}20`, color, border: `1px solid ${bg}40` }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#00B4D8]/20 hover:border-[#00B4D8]/40 transition-colors mx-auto">
                      <Eye className="w-4 h-4 text-gray-300" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500">Aucune commande trouvée</div>
        )}
      </div>
    </div>
  );
}
