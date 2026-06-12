import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { ShoppingCart, Package, ChevronDown, ChevronUp, FileDown } from 'lucide-react';
import { api, getToken } from '../../api/client';
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
  invoice_id?: number;
  created_at: string;
  items?: OrderItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid:     { label: 'PayÃ©e',      color: '#10B981' },
  pending:  { label: 'En attente', color: '#F59E0B' },
  failed:   { label: 'Ã‰chouÃ©e',   color: '#EF4444' },
  refunded: { label: 'RemboursÃ©e', color: '#7C5CFC' },
};

async function downloadInvoice(invoiceId: number, ref: string) {
  const token = getToken();
  const res = await fetch(`/api/invoices/${invoiceId}/download`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `facture-${ref}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CommandesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<Order[]>('/orders')
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function handleDownload(invoiceId: number, ref: string) {
    setDownloading(invoiceId);
    try {
      await downloadInvoice(invoiceId, ref);
    } finally {
      setDownloading(null);
    }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-ink mb-2">Mes commandes</h1>
              <p className="text-muted-foreground">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground py-8">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                Chargement...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 cyna-card">
                <ShoppingCart className="w-12 h-12 text-[#CBD3DF] mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune commande pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '#9AA3AF' };
                  const isOpen = expanded === order.id;
                  return (
                    <div key={order.id} className="cyna-card overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="w-full flex items-center justify-between p-6 hover:bg-bg-subtle transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Package className="w-6 h-6 text-[#00B4D8]" />
                          <div className="text-left">
                            <div className="text-ink font-bold">{order.ref}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: `${statusInfo.color}18`, color: statusInfo.color, border: `1px solid ${statusInfo.color}35` }}
                          >
                            {statusInfo.label}
                          </span>
                          <div className="text-xl font-bold text-ink">
                            {order.total?.toLocaleString('fr-FR')}â‚¬
                          </div>
                          {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-border p-6 space-y-4">
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-3">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <div>
                                    <span className="text-ink font-medium">{item.product?.name ?? `Produit #${item.product_id}`}</span>
                                    <span className="text-muted-foreground ml-2">Ã— {item.quantity} Â· {item.duration === 'annual' ? 'Annuel' : 'Mensuel'}</span>
                                  </div>
                                  <span className="text-ink font-semibold">
                                    {(item.unit_price * item.quantity).toLocaleString('fr-FR')}â‚¬
                                  </span>
                                </div>
                              ))}
                              <div className="pt-3 border-t border-border flex justify-between font-semibold">
                                <span className="text-ink">Total</span>
                                <span className="text-ink">{order.total?.toLocaleString('fr-FR')}â‚¬</span>
                              </div>
                            </div>
                          )}

                          {order.invoice_id && (
                            <div className="pt-2">
                              <button
                                onClick={() => handleDownload(order.invoice_id!, order.ref)}
                                disabled={downloading === order.invoice_id}
                                className="btn btn-ghost"
                              >
                                <FileDown className="w-4 h-4 text-[#00B4D8]" />
                                {downloading === order.invoice_id ? 'GÃ©nÃ©ration...' : 'TÃ©lÃ©charger la facture PDF'}
                              </button>
                            </div>
                          )}
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
