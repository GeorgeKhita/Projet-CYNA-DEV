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
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12 fade-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10B981]/12 border-2 border-[#10B981] rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-[#10B981]" />
          </div>
          <h1 className="text-4xl font-bold text-[#059669] mb-3">Commande confirmÃ©e !</h1>
          <p className="text-xl text-ink-soft mb-2">Merci pour votre confiance</p>
          <div className="inline-block bg-bg-subtle border border-border rounded-xl px-6 py-3 mb-4">
            <span className="text-muted-foreground">NumÃ©ro de commande : </span>
            <span className="text-[#0098B7] font-bold">{orderNumber}</span>
          </div>
          <p className="text-muted-foreground">Un email de confirmation a Ã©tÃ© envoyÃ© Ã  votre adresse</p>
        </div>

        <div className="cyna-card overflow-hidden mb-8">
          <div className="bg-bg-subtle p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-[#00B4D8]" />
              <h2 className="text-2xl font-bold text-ink">RÃ©capitulatif de commande</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {cart.length > 0 ? cart.map(item => (
              <div key={`${item.id}-${item.duration}`}
                className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <div className="text-ink font-semibold">{item.name}</div>
                  <div className="text-sm text-muted-foreground">QuantitÃ© : {item.quantity} â€¢ {item.duration === 'monthly' ? 'Mensuel' : 'Annuel'}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-ink">{(item.price * item.quantity).toLocaleString('fr-FR')}â‚¬</div>
                  <div className="text-sm text-muted-foreground">{item.price.toLocaleString('fr-FR')}â‚¬ Ã— {item.quantity}</div>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">Commande enregistrÃ©e</p>
            )}
            {total > 0 && (
              <div className="pt-4 flex items-center justify-between">
                <span className="text-xl text-ink font-semibold">Total mensuel</span>
                <span className="text-3xl font-bold text-ink">{total.toLocaleString('fr-FR')}â‚¬</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#10B981]/8 border border-[#10B981]/30 rounded-2xl p-6 mb-8">
          <h3 className="text-[#059669] font-semibold mb-3">ðŸš€ Prochaines Ã©tapes</h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>â€¢ Vos services seront activÃ©s dans les prochaines minutes</li>
            <li>â€¢ Vous recevrez vos accÃ¨s par email sous 5 minutes</li>
            <li>â€¢ Notre Ã©quipe support reste Ã  votre disposition 24/7</li>
          </ul>
        </div>

        <div className="text-center">
          <Link to="/espace-client" className="btn btn-primary btn-lg">
            AccÃ©der Ã  mon espace client <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
