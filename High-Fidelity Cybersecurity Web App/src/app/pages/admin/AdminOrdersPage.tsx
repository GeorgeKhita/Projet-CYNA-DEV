import { useEffect, useState } from 'react';
import { Search, CheckCircle, Clock, XCircle, Download, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { adminGetOrders, adminUpdateOrderStatus, type Order } from '../../api/orders';

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  paid:      { label: 'Actif',      icon: CheckCircle, color: '#10B981' },
  pending:   { label: 'En attente', icon: Clock,       color: '#F59E0B' },
  cancelled: { label: 'Annulé',     icon: XCircle,     color: '#EF4444' },
  refunded:  { label: 'Remboursé',  icon: XCircle,     color: '#9CA3AF' },
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage]           = useState(1);
  const [lastPage, setLastPage]   = useState(1);
  const [total, setTotal]         = useState(0);

  const load = () => {
    setLoading(true);
    adminGetOrders({ search: search || undefined, status: statusFilter !== 'all' ? statusFilter : undefined, page })
      .then((r) => { setOrders(r.data); setLastPage(r.last_page); setTotal(r.total); })
      .catch(() => setError('Impossible de charger les commandes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter, page]);

  const handleStatusChange = async (id: number, status: Order['status']) => {
    try {
      await adminUpdateOrderStatus(id, status);
      load();
    } catch { alert('Erreur lors de la mise à jour.'); }
  };

  const activeRevenue = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Commandes</h1>
          <p className="text-gray-400">{total} commandes au total</p>
        </div>
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl px-6 py-4 text-center">
          <div className="text-2xl font-bold text-[#10B981]">{activeRevenue.toLocaleString('fr-FR')}€</div>
          <div className="text-sm text-gray-400">Revenus actifs</div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            type="text" placeholder="Rechercher une commande ou un client..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]">
          <option value="all" className="bg-[#0F1F3A]">Tous les statuts</option>
          <option value="paid" className="bg-[#0F1F3A]">Actif</option>
          <option value="pending" className="bg-[#0F1F3A]">En attente</option>
          <option value="cancelled" className="bg-[#0F1F3A]">Annulé</option>
        </select>
      </div>

      {loading && <div className="flex items-center gap-3 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin" />Chargement...</div>}
      {error && <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4"><AlertCircle className="w-5 h-5 text-red-400" /><span className="text-red-400">{error}</span></div>}

      {!loading && (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Référence', 'Client', 'Produits', 'Date', 'Plan', 'Montant', 'Statut', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-gray-400 text-sm font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const s = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                const Icon = s.icon;
                return (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-[#00B4D8] font-semibold text-sm">{order.ref ?? `CYN-${order.id}`}</td>
                    <td className="px-5 py-4">
                      <div className="text-white text-sm">{order.client ?? '—'}</div>
                      <div className="text-gray-500 text-xs">{order.email}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-300 text-sm max-w-xs truncate">
                      {order.items.map((i) => i.product_name).filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{order.items[0]?.plan === 'annual' ? 'Annuel' : 'Mensuel'}</td>
                    <td className="px-5 py-4 text-white font-semibold">{order.total.toLocaleString('fr-FR')}€</td>
                    <td className="px-5 py-4">
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border bg-transparent cursor-pointer`}
                        style={{ color: s.color, borderColor: `${s.color}40` }}>
                        <option value="paid" className="bg-[#0F1F3A] text-white">Actif</option>
                        <option value="pending" className="bg-[#0F1F3A] text-white">En attente</option>
                        <option value="cancelled" className="bg-[#0F1F3A] text-white">Annulé</option>
                        <option value="refunded" className="bg-[#0F1F3A] text-white">Remboursé</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button title="Télécharger" className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <span className="text-sm text-gray-400">Page {page} / {lastPage}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-40 hover:bg-white/5 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-40 hover:bg-white/5 rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
