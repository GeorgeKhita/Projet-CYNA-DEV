import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../../api/client';

interface OrderRow {
  id: number;
  ref: string;
  client: string;
  email: string;
  items: { product_name: string; duration: string; unit_price: number; quantity: number }[];
  total: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = { paid: '#10B981', pending: '#F59E0B', failed: '#EF4444', refunded: '#8B5CF6' };
const STATUS_LABELS: Record<string, string> = { paid: 'Payée', pending: 'En attente', failed: 'Échouée', refunded: 'Remboursée' };

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  function fetchOrders(q = '') {
    setLoading(true);
    api.get<any>(`/admin/orders${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then(d => setOrders(d.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }

  async function updateStatus(id: number, status: string) {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
    } catch (err: any) { alert(err.message); }
    finally { setUpdatingId(null); }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Commandes</h1>
          <p className="text-gray-400">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); fetchOrders(search); }} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Client ou email..."
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] text-sm w-64" />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-sm">Chercher</button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-400"><div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />Chargement...</div>
      ) : (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl text-gray-500">Aucune commande</div>
          ) : orders.map(order => {
            const color = STATUS_COLORS[order.status] ?? '#9CA3AF';
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-5">
                  <button onClick={() => setExpanded(isOpen ? null : order.id)} className="text-gray-400 hover:text-white">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <span className="text-[#00B4D8] font-mono text-sm font-bold w-28">{order.ref}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{order.client}</div>
                    <div className="text-gray-500 text-xs">{order.email}</div>
                  </div>
                  <div className="text-white font-bold">{order.total?.toLocaleString('fr-FR')}€</div>
                  <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="bg-[#0A1628] border rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B4D8] disabled:opacity-50"
                    style={{ borderColor: `${color}40`, color }}>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v} style={{ color: '#fff' }}>{l}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {isOpen && (
                  <div className="border-t border-white/10 px-5 py-4 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-white">{item.product_name}</span>
                          <span className="text-gray-500 ml-2">× {item.quantity} · {item.duration === 'annual' ? 'Annuel' : 'Mensuel'}</span>
                        </div>
                        <span className="text-[#00B4D8]">{(item.unit_price * item.quantity).toLocaleString('fr-FR')}€</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
