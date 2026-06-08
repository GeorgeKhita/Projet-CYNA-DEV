import { Link, useLocation } from 'react-router';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { CartItem } from '../../lib/cart';

export function ConfirmationPage() {
  const { state } = useLocation();
  const cart: CartItem[] = state?.cart ?? [];
  const order = state?.order;
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderNumber = order?.id ? `CYN-${String(order.id).padStart(4, '0')}` : `CYN-${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10B981]/20 border-2 border-[#10B981] rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-[#10B981]" />
          </div>
          <h1 className="text-4xl font-bold text-[#10B981] mb-3">Commande confirmée !</h1>
          <p className="text-xl text-gray-300 mb-2">Merci pour votre confiance</p>
          <div className="inline-block bg-white/5 border border-white/10 rounded-lg px-6 py-3 mb-4">
            <span className="text-gray-400">Numéro de commande : </span>
            <span className="text-[#00B4D8] font-semibold">{orderNumber}</span>
          </div>
          <p className="text-gray-400">Un email de confirmation a été envoyé à votre adresse</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-white/5 to-transparent p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-[#00B4D8]" />
              <h2 className="text-2xl font-semibold text-white">Récapitulatif de commande</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {cart.length > 0 ? cart.map(item => (
              <div key={`${item.id}-${item.duration}`}
                className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                <div>
                  <div className="text-white font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400">Quantité : {item.quantity} • {item.duration === 'monthly' ? 'Mensuel' : 'Annuel'}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-[#00B4D8]">{(item.price * item.quantity).toLocaleString('fr-FR')}€</div>
                  <div className="text-sm text-gray-400">{item.price.toLocaleString('fr-FR')}€ × {item.quantity}</div>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-4">Commande enregistrée</p>
            )}
            {total > 0 && (
              <div className="pt-4 flex items-center justify-between">
                <span className="text-xl text-white font-semibold">Total mensuel</span>
                <span className="text-3xl font-bold text-[#00B4D8]">{total.toLocaleString('fr-FR')}€</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-6 mb-8">
          <h3 className="text-[#10B981] font-semibold mb-3">🚀 Prochaines étapes</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Vos services seront activés dans les prochaines minutes</li>
            <li>• Vous recevrez vos accès par email sous 5 minutes</li>
            <li>• Notre équipe support reste à votre disposition 24/7</li>
          </ul>
        </div>

        <div className="text-center">
          <Link to="/espace-client"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
            Accéder à mon espace client <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
