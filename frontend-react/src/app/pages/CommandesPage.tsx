import { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router';
import { ShoppingCart, Package, ArrowRight, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getToken } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';

interface Order {
  id: number;
  ref: string;
  status: string;
  total: number;
  invoice_id?: number;
  created_at: string;
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
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
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

  const byYear: Record<string, Order[]> = {};
  for (const order of orders) {
    const year = new Date(order.created_at).getFullYear().toString();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(order);
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

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
              <div className="space-y-8">
                {years.map(year => (
                  <div key={year}>
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="px-3 py-1 bg-bg-subtle border border-border rounded-lg">{year}</span>
                      <span>{byYear[year].length} commande{byYear[year].length > 1 ? 's' : ''}</span>
                    </h2>
                    <div className="space-y-3">
                      {byYear[year].map(order => {
                        const color = STATUS_COLORS[order.status] ?? '#9AA3AF';
                        const statusLabel = t(`orders.status_${order.status}`) || order.status;
                        const isDownloading = downloading === order.invoice_id;
                        return (
                          <div key={order.id} className="cyna-card p-5">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-4">
                                <Package className="w-5 h-5 text-[#00B4D8] shrink-0" />
                                <div>
                                  <div className="text-ink font-bold">{order.ref}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric', month: 'long', year: 'numeric',
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}
                                >
                                  {statusLabel}
                                </span>
                                <span className="text-xl font-bold text-ink">
                                  {order.total?.toLocaleString('fr-FR')}€
                                </span>
                                {order.invoice_id && (
                                  <button
                                    onClick={() => handleDownload(order.invoice_id!, order.ref, order.id)}
                                    disabled={isDownloading}
                                    title={t('orders.download_invoice')}
                                    className="btn btn-ghost btn-sm p-2"
                                  >
                                    <FileDown className={`w-4 h-4 text-[#00B4D8] ${isDownloading ? 'animate-pulse' : ''}`} />
                                  </button>
                                )}
                                <Link
                                  to={`/espace-client/commandes/${order.id}`}
                                  className="btn btn-outline btn-sm flex items-center gap-1.5"
                                >
                                  {t('orders.view_detail')} <ArrowRight className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                            {downloadError?.orderId === order.id && (
                              <p className="text-sm text-destructive mt-2">{downloadError.message}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
