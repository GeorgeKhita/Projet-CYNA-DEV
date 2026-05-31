import { Link, useNavigate } from 'react-router';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, LogIn } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const total = getTotalPrice();

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout/identification');
    } else {
      navigate('/connexion?redirect=/checkout/identification');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-white">Votre panier</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-6">Votre panier est vide</p>
            <Link
              to="/catalogue"
              className="inline-block px-8 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
            >
              Découvrir nos solutions
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.subscriptionType}`}
                  className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-6">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
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
                      <p className="text-gray-400 text-sm">Abonnement {item.subscriptionType}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-gray-300" />
                      </button>
                      <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[130px]">
                      <div className="text-2xl font-bold text-[#00B4D8]">
                        {(item.price * item.quantity).toLocaleString('fr-FR')}€
                      </div>
                      <div className="text-sm text-gray-400">
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

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
              {/* Subtotal lines */}
              <div className="space-y-2 mb-6 pb-6 border-b border-white/10">
                {items.map((item) => (
                  <div key={`${item.id}-${item.subscriptionType}`} className="flex justify-between text-sm text-gray-400">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toLocaleString('fr-FR')}€</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-xl text-gray-300">Total mensuel</span>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#00B4D8]">
                    {total.toLocaleString('fr-FR')}€
                  </div>
                  <div className="text-sm text-gray-400">par mois</div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors text-lg"
              >
                {isAuthenticated ? (
                  <>Passer à la caisse <ArrowRight className="w-5 h-5" /></>
                ) : (
                  <>Se connecter pour commander <LogIn className="w-5 h-5" /></>
                )}
              </button>
              {!isAuthenticated && (
                <p className="text-center text-gray-500 text-sm mt-2">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/connexion?redirect=/checkout/identification" className="text-[#00B4D8] hover:underline">
                    Se connecter
                  </Link>
                  {' '}·{' '}
                  <Link to="/inscription" className="text-[#00B4D8] hover:underline">
                    Créer un compte
                  </Link>
                </p>
              )}

              <Link
                to="/catalogue"
                className="block text-center mt-4 text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
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
