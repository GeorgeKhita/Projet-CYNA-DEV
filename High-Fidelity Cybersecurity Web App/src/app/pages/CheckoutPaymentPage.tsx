import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Check, CreditCard, Shield, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useCheckoutStore } from '../store/checkoutStore';
import { createOrder } from '../api/orders';

const steps = [
  { id: 1, name: 'Identification', active: false, completed: true },
  { id: 2, name: 'Adresse',        active: false, completed: true },
  { id: 3, name: 'Paiement',       active: true,  completed: false },
  { id: 4, name: 'Confirmation',   active: false, completed: false },
];

export function CheckoutPaymentPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { billingAddress, setLastOrder } = useCheckoutStore();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardNumber, setCardNumber]       = useState('');
  const [expiry, setExpiry]               = useState('');
  const [cvv, setCvv]                     = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  const total = getTotalPrice();

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const validate = () => {
    const digits = cardNumber.replace(/\s/g, '');
    if (paymentMethod === 'card') {
      if (digits.length !== 16) return 'Numéro de carte invalide (16 chiffres)';
      if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Date d'expiration invalide (MM/AA)";
      if (!/^\d{3,4}$/.test(cvv)) return 'CVV invalide';
    }
    if (items.length === 0) return 'Votre panier est vide';
    return '';
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);

    try {
      const order = await createOrder({
        items: items.map((item) => ({
          product_id: item.id,
          plan: item.subscriptionType === 'Annuel' ? 'annual' : 'monthly',
          price: item.price,
        })),
        total,
        billing_address: billingAddress ?? undefined,
      });

      setLastOrder(order.id, order.ref ?? `CYN-${order.id}`);
      clearCart();
      navigate('/confirmation');
    } catch {
      setError('Paiement refusé. Vérifiez vos informations ou réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed ? 'bg-[#10B981] text-white' : step.active ? 'bg-[#00B4D8] text-[#0A1628]' : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-medium hidden sm:block ${step.active || step.completed ? 'text-white' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paiement</h1>
          <p className="text-gray-400 mb-8">Choisissez votre méthode de paiement</p>

          {/* Résumé panier */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <div className="space-y-2 mb-3">
              {items.map((item) => (
                <div key={`${item.id}-${item.subscriptionType}`} className="flex justify-between text-sm text-gray-400">
                  <span>{item.name} × {item.quantity} ({item.subscriptionType})</span>
                  <span>{(item.price * item.quantity).toLocaleString('fr-FR')}€</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <span className="text-white font-semibold">Total</span>
              <span className="text-2xl font-bold text-[#00B4D8]">{total.toLocaleString('fr-FR')}€</span>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {(['card', 'paypal'] as const).map((m) => (
              <button key={m} onClick={() => setPaymentMethod(m)}
                className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === m ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                {m === 'card' ? (
                  <>
                    <CreditCard className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-white font-semibold">Carte bancaire</div>
                  </>
                ) : (
                  <div className="text-2xl mb-1 font-bold text-blue-400">PayPal</div>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-6">
            {paymentMethod === 'card' && (
              <>
                <div>
                  <label className="block text-white font-medium mb-2">Numéro de carte</label>
                  <input value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))}
                    type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Expiration</label>
                    <input value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      type="text" placeholder="MM/AA" maxLength={5}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">CVV</label>
                    <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      type="text" placeholder="123" maxLength={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'paypal' && (
              <div className="text-center py-6 text-gray-400">
                <p>Vous serez redirigé vers PayPal pour finaliser le paiement.</p>
              </div>
            )}

            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#10B981] font-semibold mb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Paiement sécurisé PCI-DSS
                  </div>
                  <div className="text-sm text-gray-300">
                    Données chiffrées SSL • Aucune donnée carte stockée • Conforme PCI-DSS
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || items.length === 0}
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-60 text-lg">
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Traitement...' : `Confirmer le paiement · ${total.toLocaleString('fr-FR')}€`}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/checkout/adresse" className="text-sm text-gray-400 hover:text-[#00B4D8] transition-colors">
              ← Retour à l'adresse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
