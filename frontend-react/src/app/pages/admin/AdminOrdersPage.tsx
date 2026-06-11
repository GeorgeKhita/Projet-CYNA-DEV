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

const STATUS_COLORS: Record<string, string> = { paid: '#10B981', pending: '#F59E0B', failed: '#EF4444', refunded: '#7C5CFC' };
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
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] mb-1">Commandes</h1>
          <p className="text-[#69727F]">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); fetchOrders(search); }} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA3AF]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Client ou email..."
              className="bg-white border border-[#E5E9F0] rounded-xl pl-10 pr-4 py-2.5 text-[#0A1628] focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8] text-sm w-64" />
          </div>
          <button type="submit" className="btn btn-primary">Chercher</button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-[#69727F]"><div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />Chargement...</div>
      ) : (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 cyna-card text-[#9AA3AF]">Aucune commande</div>
          ) : orders.map(order => {
            const color = STATUS_COLORS[order.status] ?? '#9AA3AF';
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="cyna-card overflow-hidden">
                <div className="flex items-center gap-4 p-5 flex-wrap">
                  <button onClick={() => setExpanded(isOpen ? null : order.id)} className="text-[#9AA3AF] hover:text-[#0A1628]">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <span className="text-[#0098B7] font-mono text-sm font-bold w-28">{order.ref}</span>
                  <div className="flex-1 min-w-[140px]">
                    <div className="text-[#0A1628] text-sm font-semibold">{order.client}</div>
                    <div className="text-[#9AA3AF] text-xs">{order.email}</div>
                  </div>
                  <div className="text-[#0A1628] font-bold">{order.total?.toLocaleString('fr-FR')}€</div>
                  <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="bg-white border rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 disabled:opacity-50"
                    style={{ borderColor: `${color}50`, color }}>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v} style={{ color: '#0A1628' }}>{l}</option>)}
                  </select>
                  <span className="text-[#69727F] text-xs">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {isOpen && (
                  <div className="border-t border-[#E5E9F0] px-5 py-4 space-y-2 bg-[#F6F8FB]">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-[#0A1628] font-medium">{item.product_name}</span>
                          <span className="text-[#9AA3AF] ml-2">× {item.quantity} · {item.duration === 'annual' ? 'Annuel' : 'Mensuel'}</span>
                        </div>
                        <span className="text-[#0A1628] font-semibold">{(item.unit_price * item.quantity).toLocaleString('fr-FR')}€</span>
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
