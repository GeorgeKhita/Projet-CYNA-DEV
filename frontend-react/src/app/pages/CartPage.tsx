import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, FileText } from 'lucide-react';
import { getCart, updateQuantity, removeFromCart, CartItem, MAX_QTY } from '../../lib/cart';

const TVA = 0.20;

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

  const totalHT  = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalTVA = totalHT * TVA;
  const totalTTC = totalHT + totalTVA;
  const isLargeOrder = totalHT > 5000;

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">Votre panier</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-6">Votre panier est vide</p>
            <Link to="/catalogue" className="btn btn-primary btn-lg">
              Découvrir nos solutions
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
                      <p className="text-muted-foreground text-sm">
                        Abonnement {item.duration === 'monthly' ? 'Mensuel' : 'Annuel'} — Prix HT
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => handleUpdateQuantity(item.id, item.duration, -1)} disabled={item.quantity <= 1}
                        className="w-8 h-8 bg-bg-subtle border border-border rounded-lg flex items-center justify-center hover:bg-bg-muted transition-colors disabled:opacity-40">
                        <Minus className="w-4 h-4 text-ink-soft" />
                      </button>
                      <span className="w-8 text-center font-bold text-ink">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.duration, 1)}
                        disabled={item.quantity >= (item.maxStock ?? MAX_QTY)}
                        className="w-8 h-8 bg-bg-subtle border border-border rounded-lg flex items-center justify-center hover:bg-bg-muted transition-colors disabled:opacity-40">
                        <Plus className="w-4 h-4 text-ink-soft" />
                      </button>
                    </div>

                    <div className="text-right min-w-[150px]">
                      <div className="text-2xl font-bold text-ink">{(item.price * item.quantity).toLocaleString('fr-FR')}€ HT</div>
                      <div className="text-sm text-muted-foreground">{item.price.toLocaleString('fr-FR')}€ HT × {item.quantity}</div>
                      {item.quantity >= (item.maxStock ?? MAX_QTY) && (
                        <div className="mt-1">
                          <p className="text-xs text-red-500 font-semibold">Stock max atteint</p>
                          <Link to="/contact" className="text-xs text-[#00B4D8] hover:underline">Pour plus, contactez-nous</Link>
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleRemove(item.id, item.duration)}
                      className="w-10 h-10 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center justify-center hover:bg-[#FEE2E2] transition-colors flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isLargeOrder && (
              <div className="mb-6 p-6 bg-[#00B4D8]/8 border border-[#00B4D8]/30 rounded-2xl flex items-start gap-4">
                <FileText className="w-6 h-6 text-[#00B4D8] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-ink mb-1">Commande importante détectée</p>
                  <p className="text-muted-foreground text-sm">
                    Pour toute commande supérieure à 5 000€ HT, notre équipe commerciale vous prépare un devis sur-mesure
                    avec des conditions préférentielles.
                  </p>
                  <Link to="/devis" className="inline-flex items-center gap-2 mt-3 text-[#00B4D8] font-semibold text-sm hover:underline">
                    Demander un devis <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            <div className="cyna-card p-8">
              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.duration}`} className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.name} ({item.duration === 'monthly' ? 'Mensuel' : 'Annuel'}) × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('fr-FR')}€ HT</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-ink-soft">
                  <span>Sous-total HT</span>
                  <span>{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>TVA (20%)</span>
                  <span>{totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xl font-bold text-ink">Total TTC</span>
                  <p className="text-xs text-muted-foreground mt-0.5">TVA 20% incluse</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-ink">{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</div>
                  <div className="text-sm text-muted-foreground">{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€ HT</div>
                </div>
              </div>

              {isLargeOrder ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 justify-center text-[#00B4D8] mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-semibold">Commande &gt; 5 000€ HT — Devis sur-mesure</span>
                  </div>
                  <Link to="/devis" className="btn btn-primary btn-lg btn-block">
                    Demander un devis <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <Link to="/checkout/identification" className="btn btn-primary btn-lg btn-block">
                  Passer à la caisse <ArrowRight className="w-5 h-5" />
                </Link>
              )}

              <Link to="/catalogue" className="block text-center mt-4 text-muted-foreground hover:text-primary transition-colors text-sm font-semibold">
                ← Continuer mes achats
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
