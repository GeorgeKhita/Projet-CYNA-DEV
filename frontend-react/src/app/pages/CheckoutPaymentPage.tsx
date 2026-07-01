import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Lock, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../../api/client';
import { getCart, clearCart } from '../../lib/cart';

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

function PaymentForm() {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const stripe   = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [promo, setPromo]               = useState<AppliedPromo | null>(null);

  const cart    = getCart();
  const baseHT  = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promo?.discount_amount ?? 0;
  const total    = Math.max(0, baseHT - discount);

  useEffect(() => {
    const saved = sessionStorage.getItem(PROMO_SESSION_KEY);
    if (saved) {
      try { setPromo(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (cart.length === 0) return;
    api.post<{ client_secret: string }>('/payments/intent', { amount: total })
      .then(res => setClientSecret(res.client_secret))
      .catch(() => setError(t('checkout.error_payment_init')));
  }, [total]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    if (cart.length === 0) { setError(t('checkout.error_empty_cart')); return; }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Erreur de paiement.');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      const cartSnapshot = [...cart];
      const tva          = Math.round(total * 0.20 * 100) / 100;
      const ttc          = Math.round((total + tva) * 100) / 100;
      const orderData: Record<string, unknown> = {
        payment_intent_id: paymentIntent.id,
        subtotal: baseHT,
        tax: tva,
        total: ttc,
        items: cartSnapshot.map(item => ({
          product_id:  item.id,
          quantity:    item.quantity,
          unit_price:  item.price,
          total_price: item.price * item.quantity,
          duration:    item.duration,
        })),
      };
      if (promo) {
        orderData.promo_code = promo.code;
      }

      try {
        const res = await api.post<any>('/orders', orderData);
        clearCart();
        sessionStorage.removeItem(PROMO_SESSION_KEY);
        navigate('/checkout/confirmation', { state: { order: res, cart: cartSnapshot } });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(
          `Votre paiement Stripe a été accepté mais la création de commande a échoué : ${msg}. ` +
          `Conservez votre référence Stripe : ${paymentIntent.id} et contactez le support.`
        );
        setLoading(false);
        return;
      }
    }

    setLoading(false);
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
        <label className="block text-ink mb-2">{t('checkout.card_info')}</label>
        <div className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus-within:ring-4 focus-within:ring-[#00B4D8]/15 focus-within:border-[#00B4D8] transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('checkout.test_hint')} <span className="text-ink-soft font-mono">4242 4242 4242 4242</span> · exp. future · CVV quelconque
        </p>
      </div>

      <div className="bg-[#10B981]/8 border border-[#10B981]/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-success font-semibold mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4" /> {t('checkout.secure_title')}
            </div>
            <div className="text-sm text-ink-soft">{t('checkout.secure_desc')}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
      )}

      <button type="submit" disabled={loading || !stripe || !clientSecret} className="btn btn-primary btn-lg btn-block">
        {loading ? t('checkout.processing') : t('checkout.confirm_purchase', { total: total.toLocaleString('fr-FR') })}
      </button>
    </form>
  );
}

export function CheckoutPaymentPage() {
  const { t } = useTranslation();

  return (
    <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
      <h1 className="text-3xl font-bold text-ink mb-2">{t('checkout.payment_title')}</h1>
      <p className="text-muted-foreground mb-8">{t('checkout.payment_subtitle')}</p>

      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
}
