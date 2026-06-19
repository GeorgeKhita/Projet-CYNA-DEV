import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { CATEGORY_COLORS } from '../../lib/cart';

interface Subscription {
  id: number;
  product?: { name: string; category?: string; category_color?: string };
  status: string;
  price: number;
  billing_cycle?: string;
  current_period_end?: string;
}

export function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<any>('/subscriptions')
      .then(data => setSubscriptions(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setSubscriptions([]))
      .finally(() => setDataLoading(false));
  }, [isAuthenticated]);

  if (authLoading) return (
    <div className="min-h-screen bg-card flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const nextRenewal = activeSubs.map(s => s.current_period_end).filter(Boolean).sort()[0];

  const stats = [
    { label: t('dashboard.active_subscriptions'), value: String(activeSubs.length), icon: CheckCircle },
    { label: t('dashboard.monthly_total'),         value: monthlyTotal > 0 ? `${monthlyTotal.toLocaleString('fr-FR')}€` : '—', icon: CreditCard },
    { label: t('dashboard.next_renewal'),          value: nextRenewal ? new Date(nextRenewal).toLocaleDateString() : '—', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-ink mb-2">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground">{t('dashboard.greeting', { name: user?.first_name })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="cyna-card p-6">
                    <div className="w-12 h-12 bg-[#00B4D8]/10 border border-[#00B4D8]/25 rounded-2xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#00B4D8]" />
                    </div>
                    <div className="text-3xl font-bold text-ink mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-ink">{t('dashboard.active_subs_title')}</h2>
                <Link to="/espace-client/abonnements" className="text-primary hover:underline text-sm font-semibold">{t('dashboard.see_all')}</Link>
              </div>

              {dataLoading ? (
                <div className="flex items-center gap-3 text-muted-foreground py-8">
                  <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                  {t('dashboard.loading')}
                </div>
              ) : activeSubs.length === 0 ? (
                <div className="text-center py-12 cyna-card">
                  <p className="text-muted-foreground mb-4">{t('dashboard.no_subs')}</p>
                  <Link to="/catalogue" className="btn btn-primary">
                    {t('dashboard.discover')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSubs.slice(0, 3).map(sub => {
                    const color = sub.product?.category_color ?? CATEGORY_COLORS[sub.product?.category ?? ''] ?? '#00B4D8';
                    const billingCycle = sub.billing_cycle === 'annual' ? t('dashboard.billing_annual') : t('dashboard.billing_monthly');
                    return (
                      <div key={sub.id} className="cyna-card cyna-card-hover p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-ink mb-2">{sub.product?.name ?? `Abonnement #${sub.id}`}</h3>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-[#10B981]/12 text-success border border-[#10B981]/30 rounded-full text-xs font-semibold">{t('dashboard.active_badge')}</span>
                              <span className="text-muted-foreground text-sm">{t('dashboard.billing_label', { cycle: billingCycle })}</span>
                            </div>
                          </div>
                          <div className="text-right mr-6">
                            <div className="text-2xl font-bold text-ink mb-1" style={{ color }}>{sub.price?.toLocaleString('fr-FR')}€</div>
                            <div className="text-sm text-muted-foreground">{t('dashboard.per_month')}</div>
                          </div>
                          <Link to="/espace-client/abonnements" className="btn btn-ghost">
                            {t('dashboard.manage')}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
