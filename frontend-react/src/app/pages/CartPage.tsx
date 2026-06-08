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
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-white">Votre panier</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-6">Votre panier est vide</p>
            <Link to="/catalogue"
              className="inline-block px-8 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
              Découvrir nos solutions
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.duration}`}
                  className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                          style={{ backgroundColor: `${item.categoryColor}20`, color: item.categoryColor, border: `1px solid ${item.categoryColor}40` }}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Abonnement {item.duration === 'monthly' ? 'Mensuel' : 'Annuel'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => handleUpdateQuantity(item.id, item.duration, -1)} disabled={item.quantity <= 1}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40">
                        <Minus className="w-4 h-4 text-gray-300" />
                      </button>
                      <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.duration, 1)}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                        <Plus className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>

                    <div className="text-right min-w-[130px]">
                      <div className="text-2xl font-bold text-[#00B4D8]">{(item.price * item.quantity).toLocaleString('fr-FR')}€</div>
                      <div className="text-sm text-gray-400">{item.price.toLocaleString('fr-FR')}€ × {item.quantity}</div>
                    </div>

                    <button onClick={() => handleRemove(item.id, item.duration)}
                      className="w-10 h-10 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg flex items-center justify-center hover:bg-[#EF4444]/20 transition-colors flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
              <div className="space-y-2 mb-6 pb-6 border-b border-white/10">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.duration}`} className="flex justify-between text-sm text-gray-400">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('fr-FR')}€</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl text-gray-300">Total mensuel</span>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#00B4D8]">{total.toLocaleString('fr-FR')}€</div>
                  <div className="text-sm text-gray-400">par mois</div>
                </div>
              </div>
              <Link to="/checkout/identification"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors text-lg">
                Passer à la caisse <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/catalogue" className="block text-center mt-4 text-gray-400 hover:text-[#00B4D8] transition-colors text-sm">
                ← Continuer mes achats
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
