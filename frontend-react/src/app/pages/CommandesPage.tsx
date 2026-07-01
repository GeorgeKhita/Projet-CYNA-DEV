import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { ShoppingCart, Package, ChevronDown, ChevronUp, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

const STATUS_COLORS: Record<string, string> = {
  paid:     '#10B981',
  pending:  '#F59E0B',
  failed:   '#EF4444',
  refunded: '#7C5CFC',
};

async function downloadInvoice(invoiceId: number, ref: string) {
  const token = getToken();
  const res = await fetch(`/api/invoices/${invoiceId}/download`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} — ${body.slice(0, 120)}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `facture-${ref}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function CommandesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<{ orderId: number; message: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<Order[]>('/orders')
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function handleDownload(invoiceId: number, ref: string, orderId: number) {
    setDownloading(invoiceId);
    setDownloadError(null);
    try {
      await downloadInvoice(invoiceId, ref);
    } catch (err: any) {
      setDownloadError({ orderId, message: err?.message ?? 'Erreur inconnue' });
    } finally {
      setDownloading(null);
    }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-card flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-ink mb-2">{t('orders.title')}</h1>
              <p className="text-muted-foreground">
                {orders.length === 1
                  ? t('orders.subtitle_singular', { count: orders.length })
                  : t('orders.subtitle_plural', { count: orders.length })}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground py-8">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                {t('orders.loading')}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 cyna-card">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('orders.no_orders')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const color = STATUS_COLORS[order.status] ?? '#9AA3AF';
                  const statusLabel = t(`orders.status_${order.status}`) || order.status;
                  const isOpen = expanded === order.id;
                  const isDownloading = downloading === order.invoice_id;
                  return (
                    <div key={order.id} className="cyna-card overflow-hidden">
                      {/* Row header — séparé en zone clic-expand et boutons d'action */}
                      <div className="flex items-center justify-between p-6 hover:bg-bg-subtle transition-colors gap-4 flex-wrap">
                        <button
                          onClick={() => setExpanded(isOpen ? null : order.id)}
                          className="flex items-center gap-4 flex-1 text-left min-w-0"
                        >
                          <Package className="w-6 h-6 text-[#00B4D8] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-ink font-bold">{order.ref}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}
                          >
                            {statusLabel}
                          </span>
                          <div className="text-xl font-bold text-ink">
                            {order.total?.toLocaleString('fr-FR')}€
                          </div>
                          {order.invoice_id && (
                            <button
                              onClick={() => handleDownload(order.invoice_id!, order.ref, order.id)}
                              disabled={isDownloading}
                              title={t('orders.download_invoice')}
                              className="btn btn-ghost btn-sm flex items-center gap-1.5"
                            >
                              <FileDown className={`w-4 h-4 text-[#00B4D8] ${isDownloading ? 'animate-pulse' : ''}`} />
                              <span className="hidden sm:inline">
                                {isDownloading ? t('orders.generating') : t('orders.download_invoice')}
                              </span>
                            </button>
                          )}
                          <button
                            onClick={() => setExpanded(isOpen ? null : order.id)}
                            className="text-muted-foreground hover:text-ink transition-colors"
                          >
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {downloadError?.orderId === order.id && (
                        <p className="px-6 pb-3 text-sm text-destructive">{downloadError.message}</p>
                      )}

                      {isOpen && (
                        <div className="border-t border-border p-6 space-y-3">
                          {order.items && order.items.length > 0 && order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="text-ink font-medium">
                                  {item.product?.name ?? `Produit #${item.product_id}`}
                                </span>
                                <span className="text-muted-foreground ml-2">
                                  × {item.quantity} · {item.duration === 'annual' ? t('orders.annual') : t('orders.monthly')}
                                </span>
                              </div>
                              <span className="text-ink font-semibold">
                                {(item.unit_price * item.quantity).toLocaleString('fr-FR')}€
                              </span>
                            </div>
                          ))}
                          {order.items && order.items.length > 0 && (
                            <div className="pt-3 border-t border-border flex justify-between font-semibold">
                              <span className="text-ink">{t('orders.total')}</span>
                              <span className="text-ink">{order.total?.toLocaleString('fr-FR')}€</span>
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
