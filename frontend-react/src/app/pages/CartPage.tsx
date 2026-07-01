import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, FileText, Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { getCart, updateQuantity, removeFromCart, CartItem, MAX_QTY } from '../../lib/cart';

const TVA = 0.20;

interface AppliedPromo {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  label: string;
  discount_amount: number;
}

const PROMO_SESSION_KEY = 'cyna_promo';

export function CartPage() {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoInput, setPromoInput]     = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError]     = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    setCartItems(getCart());
    const saved = sessionStorage.getItem(PROMO_SESSION_KEY);
    if (saved) {
      try { setAppliedPromo(JSON.parse(saved)); } catch {}
    }
  }, []);

  function handleUpdateQuantity(id: number, duration: string, delta: number) {
    updateQuantity(id, duration, delta);
    setCartItems(getCart());
  }

  function handleRemove(id: number, duration: string) {
    removeFromCart(id, duration);
    setCartItems(getCart());
  }

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) { setPromoError(t('cart.promo_error_empty')); return; }

    setPromoLoading(true);
    setPromoError('');

    try {
      const res = await api.post<AppliedPromo & { new_total_ht: number }>('/promo-codes/validate', {
        code,
        total_ht: baseHT,
      });
      const promo: AppliedPromo = {
        code:            res.code,
        type:            res.type,
        value:           res.value,
        label:           res.label,
        discount_amount: res.discount_amount ?? 0,
      };
      setAppliedPromo(promo);
      sessionStorage.setItem(PROMO_SESSION_KEY, JSON.stringify(promo));
      setPromoInput('');
    } catch (err: any) {
      setPromoError(err?.message ?? 'Code invalide.');
    } finally {
      setPromoLoading(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    sessionStorage.removeItem(PROMO_SESSION_KEY);
    setPromoError('');
  }

  const baseHT    = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount  = appliedPromo?.discount_amount ?? 0;
  const totalHT   = Math.max(0, baseHT - discount);
  const totalTVA  = totalHT * TVA;
  const totalTTC  = totalHT + totalTVA;
  const isLargeOrder = baseHT > 5000;

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">{t('cart.title')}</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-6">{t('cart.empty')}</p>
            <Link to="/catalogue" className="btn btn-primary btn-lg">
              {t('cart.discover')}
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
                        {t('cart.subscription', { cycle: item.duration === 'monthly' ? t('cart.monthly') : t('cart.annual') })}
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
                          <p className="text-xs text-red-500 font-semibold">{t('cart.stock_max')}</p>
                          <Link to="/contact" className="text-xs text-[#00B4D8] hover:underline">{t('cart.contact_more')}</Link>
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleRemove(item.id, item.duration)}
                      aria-label="Supprimer du panier"
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
                  <p className="font-bold text-ink mb-1">{t('cart.large_order_title')}</p>
                  <p className="text-muted-foreground text-sm">{t('cart.large_order_desc')}</p>
                  <Link to="/devis" className="inline-flex items-center gap-2 mt-3 text-[#00B4D8] font-semibold text-sm hover:underline">
                    {t('cart.request_quote')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            <div className="cyna-card p-8">
              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.duration}`} className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.name} ({item.duration === 'monthly' ? t('cart.monthly') : t('cart.annual')}) × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('fr-FR')}€ HT</span>
                  </div>
                ))}
              </div>

              {/* ── Code promo ── */}
              <div className="mb-6 pb-6 border-b border-border">
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-[#10B981]/8 border border-[#10B981]/30 rounded-xl">
                    <div className="flex items-center gap-2 text-[#10B981] font-semibold text-sm">
                      <Tag className="w-4 h-4" />
                      <span>{appliedPromo.code}</span>
                      <span className="text-[#10B981]/70">({appliedPromo.label})</span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      aria-label={t('cart.promo_remove')}
                      className="p-1 rounded-lg hover:bg-[#10B981]/15 transition-colors"
                    >
                      <X className="w-4 h-4 text-[#10B981]" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        placeholder={t('cart.promo_placeholder')}
                        className="flex-1 bg-bg-subtle border border-border rounded-xl px-4 py-2.5 text-ink text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 focus:border-[#00B4D8] transition-all"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                        className="btn btn-ghost btn-sm px-4 border border-border rounded-xl text-sm font-semibold shrink-0"
                      >
                        {promoLoading ? t('cart.promo_loading') : t('cart.promo_apply')}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-destructive">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-ink-soft">
                  <span>{t('cart.subtotal_ht')}</span>
                  <span>{baseHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-[#10B981] font-semibold">
                    <span>{t('cart.promo_discount', { code: appliedPromo.code })}</span>
                    <span>-{appliedPromo.discount_amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-soft">
                  <span>{t('cart.tva')}</span>
                  <span>{totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xl font-bold text-ink">{t('cart.total_ttc')}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('cart.tva_included')}</p>
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
                    <span className="text-sm font-semibold">{t('cart.large_order_label')}</span>
                  </div>
                  <Link to="/devis" className="btn btn-primary btn-lg btn-block">
                    {t('cart.request_quote')} <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <Link to="/checkout/identification" className="btn btn-primary btn-lg btn-block">
                  {t('cart.checkout')} <ArrowRight className="w-5 h-5" />
                </Link>
              )}

              <Link to="/catalogue" className="block text-center mt-4 text-muted-foreground hover:text-primary transition-colors text-sm font-semibold">
                {t('cart.continue_shopping')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
