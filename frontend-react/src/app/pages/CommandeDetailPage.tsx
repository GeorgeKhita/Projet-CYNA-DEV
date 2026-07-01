import { useState, useEffect } from 'react';
import { Navigate, useLocation, useParams, Link } from 'react-router';
import { ArrowLeft, Package, FileDown } from 'lucide-react';
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
  subtotal?: number;
  tax?: number;
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
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

export function CommandeDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [order, setOrder]           = useState<Order | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    api.get<Order>(`/orders/${id}`)
      .then(data => setOrder(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [isAuthenticated, id]);

  async function handleDownload() {
    if (!order?.invoice_id) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadInvoice(order.invoice_id, order.ref);
    } catch (err: any) {
      setDownloadError(err?.message ?? 'Erreur inconnue');
    } finally {
      setDownloading(false);
    }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-card flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  const items = order?.items ?? [];
  const subtotalHT = order?.subtotal ?? items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const tva        = order?.tax       ?? subtotalHT * 0.2;
  const totalTTC   = order?.total     ?? subtotalHT + tva;
  const color       = STATUS_COLORS[order?.status ?? ''] ?? '#9AA3AF';
  const statusLabel = order ? (t(`orders.status_${order.status}`) || order.status) : '';

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-6">
            <Link to="/espace-client/commandes" className="btn btn-ghost btn-sm inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> {t('orders.back')}
            </Link>

            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground py-8">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                {t('orders.loading')}
              </div>
            ) : notFound ? (
              <div className="text-center py-16 cyna-card">
                <p className="text-muted-foreground">{t('orders.not_found')}</p>
              </div>
            ) : order && (
              <>
                <div className="cyna-card p-6 flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Package className="w-8 h-8 text-[#00B4D8]" />
                    <div>
                      <h1 className="text-2xl font-bold text-ink">{order.ref}</h1>
                      <p className="text-muted-foreground text-sm">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="cyna-card overflow-hidden">
                  <div className="bg-bg-subtle p-5 border-b border-border">
                    <h2 className="font-semibold text-ink">{t('orders.detail_title')}</h2>
                  </div>
                  <div className="p-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left pb-3 font-medium text-muted-foreground">{t('orders.product_col')}</th>
                          <th className="text-center pb-3 font-medium text-muted-foreground">{t('orders.qty_col')}</th>
                          <th className="text-center pb-3 font-medium text-muted-foreground">{t('orders.period_col')}</th>
                          <th className="text-right pb-3 font-medium text-muted-foreground">{t('orders.unit_price_col')}</th>
                          <th className="text-right pb-3 font-medium text-muted-foreground">{t('orders.line_total_col')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-3 text-ink font-medium">
                              {item.product?.name ?? `Produit #${item.product_id}`}
                            </td>
                            <td className="py-3 text-center text-muted-foreground">{item.quantity}</td>
                            <td className="py-3 text-center text-muted-foreground">
                              {item.duration === 'annual' ? t('orders.annual') : t('orders.monthly')}
                            </td>
                            <td className="py-3 text-right text-muted-foreground">
                              {item.unit_price.toLocaleString('fr-FR')}€
                            </td>
                            <td className="py-3 text-right text-ink font-semibold">
                              {(item.unit_price * item.quantity).toLocaleString('fr-FR')}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-6 pt-4 border-t border-border space-y-2 max-w-xs ml-auto text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t('orders.subtotal_ht')}</span>
                        <span>{subtotalHT.toLocaleString('fr-FR')}€</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t('orders.tva')}</span>
                        <span>{tva.toLocaleString('fr-FR')}€</span>
                      </div>
                      <div className="flex justify-between font-bold text-ink text-base pt-2 border-t border-border">
                        <span>{t('orders.total_ttc')}</span>
                        <span>{totalTTC.toLocaleString('fr-FR')}€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.invoice_id && (
                  <div className="space-y-2">
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="btn btn-ghost flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4 text-[#00B4D8]" />
                      {downloading ? t('orders.generating') : t('orders.download_invoice')}
                    </button>
                    {downloadError && (
                      <p className="text-sm text-destructive">{downloadError}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
