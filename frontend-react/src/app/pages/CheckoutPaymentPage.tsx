import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Lock, MapPin, CreditCard, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../../api/client';
import { getCart, clearCart, CartItem } from '../../lib/cart';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PROMO_SESSION_KEY = 'cyna_promo';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#FFFFFF',
      fontFamily: 'inherit',
      fontSize: '16px',
      '::placeholder': { color: '#8A9BB0' },
    },
    invalid: { color: '#F87171' },
  },
};

interface AppliedPromo {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  label: string;
  discount_amount: number;
}

// ── Récapitulatif de commande ─────────────────────────────────────────────

interface SummaryProps {
  cart: CartItem[];
  billingAddress: Record<string, string> | null;
  promo: AppliedPromo | null;
}

function OrderSummary({ cart, billingAddress, promo }: SummaryProps) {
  const { t } = useTranslation();
  const baseHT   = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promo?.discount_amount ?? 0;
  const total    = Math.max(0, baseHT - discount);
  const tva      = Math.round(total * 0.20 * 100) / 100;
  const ttc      = Math.round((total + tva) * 100) / 100;

  return (
    <div className="cyna-card p-6 shadow-[var(--shadow-md)] h-fit">
      <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[#00B4D8]" />
        {t('checkout.order_summary')}
      </h2>

      <div className="space-y-3 mb-6">
        {cart.map(item => (
          <div key={`${item.id}-${item.duration}`} className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-ink text-sm font-semibold truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground">
                {item.duration === 'monthly' ? 'Mensuel' : 'Annuel'} x {item.quantity}
              </div>
            </div>
            <span className="text-ink text-sm font-semibold whitespace-nowrap">
              {(item.price * item.quantity).toLocaleString('fr-FR')} €
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('checkout.subtotal_ht')}</span>
          <span>{baseHT.toLocaleString('fr-FR')} €</span>
        </div>
        {promo && (
          <div className="flex justify-between text-sm text-[#10B981]">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {promo.code}
            </span>
            <span>-{discount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('checkout.tva_line')}</span>
          <span>{tva.toLocaleString('fr-FR')} €</span>
        </div>
        <div className="flex justify-between font-bold text-ink pt-2 border-t border-border">
          <span>{t('checkout.total_ttc')}</span>
          <span className="text-[#00B4D8] text-lg">{ttc.toLocaleString('fr-FR')} €</span>
        </div>
      </div>

      {billingAddress && (
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('checkout.billing_address')}
          </h3>
          <div className="text-sm text-ink-soft space-y-0.5">
            <div>{billingAddress.first_name} {billingAddress.last_name}</div>
            {billingAddress.address1 && <div>{billingAddress.address1}</div>}
            {billingAddress.address2 && <div>{billingAddress.address2}</div>}
            <div>{billingAddress.postal_code} {billingAddress.city}</div>
            <div>{billingAddress.country}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Formulaire Stripe ─────────────────────────────────────────────────────

interface PaymentFormProps {
  cart: CartItem[];
  promo: AppliedPromo | null;
  billingAddress: Record<string, string> | null;
}

function PaymentForm({ cart, promo, billingAddress }: PaymentFormProps) {
  const navigate  = useNavigate();
  const { t }    = useTranslation();
  const stripe   = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const baseHT   = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promo?.discount_amount ?? 0;
  const total    = Math.max(0, baseHT - discount);
  const tva      = Math.round(total * 0.20 * 100) / 100;
  const ttc      = Math.round((total + tva) * 100) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (cart.length === 0) { setError(t('checkout.error_empty_cart')); return; }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) { setLoading(false); return; }

    const cartSnapshot = [...cart];

    // 1. Création de la commande (pending) + PaymentIntent. Les prix sont figés
    //    côté serveur : on n'envoie que les articles et l'éventuel code promo.
    let orderId: number;
    let clientSecret: string;
    try {
      const created = await api.post<{ order_id: number; client_secret: string }>('/orders', {
        items: cartSnapshot.map(item => ({
          product_id: item.id,
          quantity:   item.quantity,
          duration:   item.duration,
        })),
        ...(promo ? { promo_code: promo.code } : {}),
      });
      orderId      = created.order_id;
      clientSecret = created.client_secret;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('checkout.error_payment_init'));
      setLoading(false);
      return;
    }

    // Email du client (connecté ou invité) → colonne "Client" sur Stripe
    const customerEmail = (() => {
      try {
        const u = JSON.parse(localStorage.getItem('cyna_user') ?? 'null');
        if (u?.email) return u.email as string;
        const g = JSON.parse(sessionStorage.getItem('cyna_guest') ?? 'null');
        return (g?.email as string) || undefined;
      } catch { return undefined; }
    })();

    // Coordonnées client (email + nom + adresse) → affichées sur Stripe
    const billingDetails: Record<string, unknown> = {};
    if (customerEmail) billingDetails.email = customerEmail;
    if (billingAddress) {
      const name = [billingAddress.first_name, billingAddress.last_name].filter(Boolean).join(' ');
      if (name) billingDetails.name = name;
      if (billingAddress.phone_number) billingDetails.phone = billingAddress.phone_number;
      billingDetails.address = {
        line1:       billingAddress.address1 || undefined,
        line2:       billingAddress.address2 || undefined,
        city:        billingAddress.city || undefined,
        postal_code: billingAddress.postal_code || undefined,
        country:     billingAddress.country || undefined,
      };
    }
    const hasBillingDetails = Object.keys(billingDetails).length > 0;

    // 2. Débit de la carte via Stripe (intent de la commande créée à l'étape 1)
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        ...(hasBillingDetails ? { billing_details: billingDetails } : {}),
      },
    });

    if (stripeError) {
      const isDeclined = stripeError.decline_code != null || stripeError.code === 'card_declined';
      setError(isDeclined ? t('checkout.error_card_declined') : (stripeError.message ?? 'Erreur de paiement.'));
      setLoading(false);
      return;
    }

    if (paymentIntent?.status !== 'succeeded') {
      setLoading(false);
      return;
    }

    // 3. Finalisation côté serveur : abonnements, licences, facture PDF
    //    et envoi de l'email de confirmation.
    try {
      const res = await api.post<Record<string, unknown>>(`/orders/${orderId}/confirm`, {});
      clearCart();
      sessionStorage.removeItem('cyna_billing_address');
      sessionStorage.removeItem('cyna_guest');
      sessionStorage.removeItem(PROMO_SESSION_KEY);
      navigate('/checkout/confirmation', { state: { order: res, cart: cartSnapshot } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(t('checkout.error_order_failed', { id: paymentIntent.id }) + ` (${msg})`);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {promo && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#10B981]/8 border border-[#10B981]/30 rounded-xl text-[#10B981] text-sm font-semibold">
          <Tag className="w-4 h-4 shrink-0" />
          <span>Code <strong>{promo.code}</strong> appliqué ({promo.label}) — économie de {promo.discount_amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
        </div>
      )}

      <div>
        <label className="block text-ink mb-2 font-semibold">{t('checkout.card_info')}</label>
        <div className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus-within:ring-4 focus-within:ring-[#00B4D8]/15 focus-within:border-[#00B4D8] transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <div className="bg-[#10B981]/8 border border-[#10B981]/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-success font-semibold mb-0.5 flex items-center gap-2">
              <Lock className="w-4 h-4" /> {t('checkout.secure_title')}
            </div>
            <div className="text-sm text-ink-soft">{t('checkout.secure_desc')}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="btn btn-primary btn-lg btn-block"
      >
        {loading
          ? t('checkout.processing')
          : t('checkout.confirm_purchase', { total: ttc.toLocaleString('fr-FR') })}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate('/checkout/adresse')}
          className="text-sm text-muted-foreground hover:text-ink transition-colors"
        >
          ← {t('checkout.back_to_address')}
        </button>
      </div>
    </form>
  );
}

// ── Page principale ───────────────────────────────────────────────────────

export function CheckoutPaymentPage() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const cart     = getCart();

  const billingAddress = (() => {
    try { return JSON.parse(sessionStorage.getItem('cyna_billing_address') ?? 'null') as Record<string, string> | null; }
    catch { return null; }
  })();

  const [promo] = useState<AppliedPromo | null>(() => {
    const saved = sessionStorage.getItem(PROMO_SESSION_KEY);
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  useEffect(() => {
    if (cart.length === 0) navigate('/panier', { replace: true });
  }, []);

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-5xl mx-auto px-6">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          <div className="lg:col-span-3 cyna-card p-8 shadow-[var(--shadow-md)]">
            <h1 className="text-3xl font-bold text-ink mb-2">{t('checkout.payment_title')}</h1>
            <p className="text-muted-foreground mb-8">{t('checkout.payment_subtitle')}</p>

            <Elements stripe={stripePromise}>
              <PaymentForm cart={cart} promo={promo} billingAddress={billingAddress} />
            </Elements>
          </div>

          <div className="lg:col-span-2">
            <OrderSummary cart={cart} billingAddress={billingAddress} promo={promo} />
          </div>

        </div>
      </div>
    </div>
  );
}
