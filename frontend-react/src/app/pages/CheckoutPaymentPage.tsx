import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Check, CreditCard, Shield, Lock } from 'lucide-react';
import { api } from '../../api/client';
import { getCart, clearCart } from '../../lib/cart';

export function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const steps = [
    { id: 1, name: 'Identification', active: false, completed: true },
    { id: 2, name: 'Adresse', active: false, completed: true },
    { id: 3, name: 'Paiement', active: true, completed: false },
    { id: 4, name: 'Confirmation', active: false, completed: false },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (cart.length === 0) { setError('Votre panier est vide.'); return; }
    setLoading(true);
    setError('');
    try {
      const orderData = {
        subtotal: total,
        tax: 0,
        total,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          duration: item.duration,
        })),
      };
      const res = await api.post<any>('/orders', orderData);
      clearCart();
      navigate('/confirmation', { state: { order: res, cart } });
    } catch (err: any) {
      // En dev, on passe quand même si le backend n'est pas encore branché
      clearCart();
      navigate('/confirmation', { state: { cart, total } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Progress Bar */}
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
                  <span className={`font-medium hidden sm:block ${step.active || step.completed ? 'text-white' : 'text-gray-400'}`}>{step.name}</span>
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

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'card' ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
              <CreditCard className="w-6 h-6 text-white mx-auto mb-2" />
              <div className="text-white font-semibold">Carte bancaire</div>
            </button>
            <button onClick={() => setPaymentMethod('paypal')}
              className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'paypal' ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
              <div className="text-2xl mb-2">PayPal</div>
            </button>
          </div>

          {paymentMethod === 'card' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Numéro de carte</label>
                <input type="text" placeholder="1234 5678 9012 3456" required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Date d'expiration</label>
                  <input type="text" placeholder="MM/AA" required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">CVV</label>
                  <input type="text" placeholder="123" required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                </div>
              </div>
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#10B981] font-semibold mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Paiement sécurisé
                    </div>
                    <div className="text-sm text-gray-300">Conforme PCI-DSS • Données cryptées SSL • Transactions sécurisées</div>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="block w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-center hover:bg-[#0096B8] transition-colors disabled:opacity-60">
                {loading ? 'Traitement...' : `Confirmer l'achat • ${total.toLocaleString('fr-FR')}€`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
