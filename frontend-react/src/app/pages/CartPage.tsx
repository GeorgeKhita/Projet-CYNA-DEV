import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { getCart, updateQuantity, removeFromCart, CartItem } from '../../lib/cart';

export function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => { setCartItems(getCart()); }, []);

  function handleUpdateQuantity(id: number, duration: string, delta: number) {
    updateQuantity(id, duration, delta);
    setCartItems(getCart());
  }

  function handleRemove(id: number, duration: string) {
    removeFromCart(id, duration);
    setCartItems(getCart());
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">Votre panier</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-[#CBD3DF] mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-6">Votre panier est vide</p>
            <Link to="/catalogue" className="btn btn-primary btn-lg">
              DÃ©couvrir nos solutions
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.duration}`} className="cyna-card cyna-card-hover p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-ink">{item.name}</h3>
                        <span className="chip flex-shrink-0"
                          style={{ backgroundColor: `${item.categoryColor}18`, color: item.categoryColor, border: `1px solid ${item.categoryColor}35` }}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">Abonnement {item.duration === 'monthly' ? 'Mensuel' : 'Annuel'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => handleUpdateQuantity(item.id, item.duration, -1)} disabled={item.quantity <= 1}
                        className="w-8 h-8 bg-bg-subtle border border-border rounded-lg flex items-center justify-center hover:bg-bg-muted transition-colors disabled:opacity-40">
                        <Minus className="w-4 h-4 text-ink-soft" />
                      </button>
                      <span className="w-8 text-center font-bold text-ink">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.duration, 1)}
                        className="w-8 h-8 bg-bg-subtle border border-border rounded-lg flex items-center justify-center hover:bg-bg-muted transition-colors">
                        <Plus className="w-4 h-4 text-ink-soft" />
                      </button>
                    </div>

                    <div className="text-right min-w-[130px]">
                      <div className="text-2xl font-bold text-ink">{(item.price * item.quantity).toLocaleString('fr-FR')}â‚¬</div>
                      <div className="text-sm text-muted-foreground">{item.price.toLocaleString('fr-FR')}â‚¬ Ã— {item.quantity}</div>
                    </div>

                    <button onClick={() => handleRemove(item.id, item.duration)}
                      className="w-10 h-10 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center justify-center hover:bg-[#FEE2E2] transition-colors flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cyna-card p-8">
              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.duration}`} className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.name} Ã— {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('fr-FR')}â‚¬</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl text-ink-soft">Total mensuel</span>
                <div className="text-right">
                  <div className="text-4xl font-bold text-ink">{total.toLocaleString('fr-FR')}â‚¬</div>
                  <div className="text-sm text-muted-foreground">par mois</div>
                </div>
              </div>
              <Link to="/checkout/identification" className="btn btn-primary btn-lg btn-block">
                Passer Ã  la caisse <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/catalogue" className="block text-center mt-4 text-muted-foreground hover:text-[#0098B7] transition-colors text-sm font-semibold">
                â† Continuer mes achats
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
