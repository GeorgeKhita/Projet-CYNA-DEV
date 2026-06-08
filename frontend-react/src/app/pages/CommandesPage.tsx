import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { ShoppingCart, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';

interface OrderItem {
  product_id: number;
  product?: { name: string };
  quantity: number;
  unit_price: number;
  duration: string;
}

interface Order {
  id: number;
  ref: string;
  status: string;
  total: number;
  created_at: string;
  items?: OrderItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid:     { label: 'Payée',    color: '#10B981' },
  pending:  { label: 'En attente', color: '#F59E0B' },
  failed:   { label: 'Échouée', color: '#EF4444' },
  refunded: { label: 'Remboursée', color: '#8B5CF6' },
};

export function CommandesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<Order[]>('/orders')
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Mes commandes</h1>
              <p className="text-gray-400">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-gray-400 py-8">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                Chargement...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
                <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune commande pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '#9CA3AF' };
                  const isOpen = expanded === order.id;
                  return (
                    <div key={order.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                      <button onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <Package className="w-6 h-6 text-[#00B4D8]" />
                          <div className="text-left">
                            <div className="text-white font-semibold">{order.ref}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color, border: `1px solid ${statusInfo.color}40` }}>
                            {statusInfo.label}
                          </span>
                          <div className="text-right">
                            <div className="text-xl font-bold text-[#00B4D8]">{order.total?.toLocaleString('fr-FR')}€</div>
                          </div>
                          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </button>

                      {isOpen && order.items && (
                        <div className="border-t border-white/10 p-6 space-y-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="text-white">{item.product?.name ?? `Produit #${item.product_id}`}</span>
                                <span className="text-gray-500 ml-2">× {item.quantity} · {item.duration === 'annual' ? 'Annuel' : 'Mensuel'}</span>
                              </div>
                              <span className="text-[#00B4D8] font-semibold">{(item.unit_price * item.quantity).toLocaleString('fr-FR')}€</span>
                            </div>
                          ))}
                          <div className="pt-3 border-t border-white/10 flex justify-between font-semibold">
                            <span className="text-white">Total</span>
                            <span className="text-[#00B4D8]">{order.total?.toLocaleString('fr-FR')}€</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
