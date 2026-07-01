import { Link, useLocation } from 'react-router';
import { CheckCircle2, Package, Key, ArrowRight, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../../lib/cart';

interface License {
  license_key: string;
  product_name: string;
}

interface OrderState {
  id?: number;
  ref?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  licenses?: License[];
}

export function ConfirmationPage() {
  const { state }  = useLocation();
  const { t }      = useTranslation();
  const cart: CartItem[]       = state?.cart ?? [];
  const order: OrderState | null = state?.order ?? null;

  const subtotal = order?.subtotal ?? cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax      = order?.tax      ?? Math.round(subtotal * 0.20 * 100) / 100;
  const total    = order?.total    ?? Math.round((subtotal + tax) * 100) / 100;
  const licenses: License[]    = order?.licenses ?? [];

  const orderNumber = order?.ref
    ?? (order?.id ? `CYN-${String(order.id).padStart(4, '0')}` : `CYN-${Date.now().toString().slice(-6)}`);

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">

        {/* En-tête de confirmation */}
        <div className="text-center mb-12 fade-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10B981]/12 border-2 border-[#10B981] rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-[#10B981]" />
          </div>
          <h1 className="text-4xl font-bold text-success mb-3">{t('confirmation.title')}</h1>
          <p className="text-xl text-ink-soft mb-2">{t('confirmation.thank_you')}</p>
          <div className="inline-block bg-bg-subtle border border-border rounded-xl px-6 py-3 mb-4">
            <span className="text-muted-foreground">{t('confirmation.order_number')} </span>
            <span className="text-[#00B4D8] font-bold text-lg">{orderNumber}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Mail className="w-4 h-4" />
            <span>{t('confirmation.email_sent')}</span>
          </div>
        </div>

        {/* Récapitulatif de commande */}
        <div className="cyna-card overflow-hidden mb-6">
          <div className="bg-bg-subtle p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-[#00B4D8]" />
              <h2 className="text-2xl font-bold text-ink">{t('confirmation.order_summary')}</h2>
            </div>
          </div>
          <div className="p-6">
            {cart.length > 0 ? (
              <>
                <div className="space-y-0">
                  {cart.map(item => (
                    <div
                      key={`${item.id}-${item.duration}`}
                      className="flex items-center justify-between py-4 border-b border-border last:border-0"
                    >
                      <div>
                        <div className="text-ink font-semibold">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {t('confirmation.quantity')} {item.quantity} ·{' '}
                          {item.duration === 'monthly' ? t('confirmation.monthly') : t('confirmation.annual')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-ink">
                          {(item.price * item.quantity).toLocaleString('fr-FR')} €
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.price.toLocaleString('fr-FR')} € × {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="pt-4 space-y-2 border-t border-border mt-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('confirmation.subtotal_ht')}</span>
                    <span>{subtotal.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('confirmation.tva')}</span>
                    <span>{tax.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between font-bold text-ink text-xl pt-2 border-t border-border">
                    <span>{t('confirmation.total_ttc')}</span>
                    <span className="text-[#00B4D8]">{total.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">{t('confirmation.order_registered')}</p>
            )}
          </div>
        </div>

        {/* Clés de licence */}
        {licenses.length > 0 && (
          <div className="cyna-card overflow-hidden mb-6">
            <div className="bg-bg-subtle p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6 text-[#00B4D8]" />
                <h2 className="text-2xl font-bold text-ink">{t('confirmation.license_keys')}</h2>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {licenses.map((lic, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-ink font-medium">{lic.product_name}</span>
                  <code className="text-[#00B4D8] font-mono text-sm bg-bg-subtle px-3 py-1 rounded-lg">
                    {lic.license_key}
                  </code>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-2">{t('confirmation.keep_licenses')}</p>
            </div>
          </div>
        )}

        {/* Prochaines étapes */}
        <div className="bg-[#10B981]/8 border border-[#10B981]/30 rounded-2xl p-6 mb-8">
          <h3 className="text-success font-semibold mb-3">{t('confirmation.next_steps')}</h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>• {t('confirmation.step1')}</li>
            <li>• {t('confirmation.step2')}</li>
            <li>• {t('confirmation.step3')}</li>
          </ul>
        </div>

        <div className="text-center">
          <Link to="/espace-client" className="btn btn-primary btn-lg">
            {t('confirmation.go_dashboard')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
