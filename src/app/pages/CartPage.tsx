import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Cyna SOC Premium',
      category: 'SOC',
      categoryColor: '#00B4D8',
      subscriptionType: 'Mensuel',
      price: 1299,
      quantity: 1,
    },
    {
      id: 2,
      name: 'Cyna EDR Enterprise',
      category: 'EDR',
      categoryColor: '#8B5CF6',
      subscriptionType: 'Annuel',
      price: 899,
      quantity: 2,
    },
    {
      id: 3,
      name: 'Cyna XDR Suite',
      category: 'XDR',
      categoryColor: '#10B981',
      subscriptionType: 'Mensuel',
      price: 1799,
      quantity: 1,
    },
  ]);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-foreground">Votre panier</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-6">Votre panier est vide</p>
            <Link
              to="/catalogue"
              className="inline-block px-8 py-3 bg-[#00B4D8] text-primary-foreground font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
            >
              Découvrir nos solutions
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-card to-card border border-border rounded-xl p-6 hover:border-border transition-all"
                >
                  <div className="flex items-center gap-6">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                          style={{
                            backgroundColor: `${item.categoryColor}20`,
                            color: item.categoryColor,
                            border: `1px solid ${item.categoryColor}40`,
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">Abonnement {item.subscriptionType}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-muted/50 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-muted/50 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[130px]">
                      <div className="text-2xl font-bold text-[#00B4D8]">
                        {(item.price * item.quantity).toLocaleString('fr-FR')}€
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.price.toLocaleString('fr-FR')}€ × {item.quantity}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg flex items-center justify-center hover:bg-[#EF4444]/20 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-card to-card border border-border rounded-xl p-8">
              {/* Subtotal lines */}
              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toLocaleString('fr-FR')}€</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-xl text-muted-foreground">Total mensuel</span>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#00B4D8]">
                    {total.toLocaleString('fr-FR')}€
                  </div>
                  <div className="text-sm text-muted-foreground">par mois</div>
                </div>
              </div>

              <Link
                to="/checkout/identification"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#00B4D8] text-primary-foreground font-semibold rounded-lg hover:bg-[#0096B8] transition-colors text-lg"
              >
                Passer à la caisse
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/catalogue"
                className="block text-center mt-4 text-muted-foreground hover:text-[#00B4D8] transition-colors text-sm"
              >
                ← Continuer mes achats
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
