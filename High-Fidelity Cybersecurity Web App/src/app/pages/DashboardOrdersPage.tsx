import { useEffect, useState } from 'react';
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { getMyOrders, type Order } from '../api/orders';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid:      { label: 'Actif',      color: 'text-[#10B981] bg-[#10B981]/20 border-[#10B981]/30' },
  pending:   { label: 'En attente', color: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30' },
  cancelled: { label: 'Annulé',     color: 'text-red-400 bg-red-400/20 border-red-400/30' },
  refunded:  { label: 'Remboursé',  color: 'text-gray-400 bg-gray-400/20 border-gray-400/30' },
};

export function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setError('Impossible de charger vos commandes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <DashboardSidebar active="orders" />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Mes commandes</h1>
              <p className="text-gray-400">Historique de vos abonnements et factures</p>
            </div>

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

            {!loading && !error && orders.length === 0 && (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Aucune commande pour le moment.</p>
              </div>
            )}

            {!loading && orders.length > 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Référence</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Produits</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Date</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Plan</th>
                      <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">Montant</th>
                      <th className="text-center px-6 py-4 text-gray-400 font-medium text-sm">Statut</th>
                      <th className="px-6 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const s = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
                      return (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-[#00B4D8] font-semibold text-sm">
                            {order.ref ?? `CYN-${order.id}`}
                          </td>
                          <td className="px-6 py-4 text-white text-sm">
                            {order.items.map((i) => i.product_name).filter(Boolean).join(', ') || '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {order.items[0]?.plan === 'annual' ? 'Annuel' : 'Mensuel'}
                          </td>
                          <td className="px-6 py-4 text-right text-[#00B4D8] font-semibold">
                            {order.total.toLocaleString('fr-FR')}€
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${s.color}`}>
                              {s.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              title="Télécharger facture"
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
