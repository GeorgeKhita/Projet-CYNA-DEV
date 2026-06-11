import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
  CATEGORY_COLORS,
  type CartItem,
} from './cart';

const baseItem: Omit<CartItem, 'quantity'> = {
  id: 1,
  name: 'CYNA SOC',
  category: 'SOC',
  categoryColor: '#00B4D8',
  price: 299.99,
  duration: 'monthly',
};

beforeEach(() => {
  localStorage.clear();
});

// ── getCart ───────────────────────────────────────────────────────────────

describe('getCart', () => {
  it('retourne un tableau vide quand le panier est vide', () => {
    expect(getCart()).toEqual([]);
  });

  it('parse correctement les items stockés', () => {
    localStorage.setItem('cyna_cart', JSON.stringify([{ ...baseItem, quantity: 2 }]));
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('CYNA SOC');
    expect(cart[0].quantity).toBe(2);
  });

  it('retourne un tableau vide si le JSON est corrompu', () => {
    localStorage.setItem('cyna_cart', 'invalid-json{{{');
    expect(getCart()).toEqual([]);
  });
});

// ── addToCart ─────────────────────────────────────────────────────────────

describe('addToCart', () => {
  it('ajoute un nouvel item avec quantity=1', () => {
    addToCart(baseItem);
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
    expect(cart[0].id).toBe(1);
  });

  it("incrémente la quantité si l'item existe déjà (même id + durée)", () => {
    addToCart(baseItem);
    addToCart(baseItem);
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('traite comme items distincts si la durée diffère', () => {
    addToCart(baseItem);
    addToCart({ ...baseItem, duration: 'annual' });
    expect(getCart()).toHaveLength(2);
  });

  it('traite comme items distincts si les ids diffèrent', () => {
    addToCart(baseItem);
    addToCart({ ...baseItem, id: 2, name: 'CYNA EDR' });
    expect(getCart()).toHaveLength(2);
  });

  it('persiste dans localStorage', () => {
    addToCart(baseItem);
    expect(localStorage.getItem('cyna_cart')).not.toBeNull();
  });
});

// ── updateQuantity ────────────────────────────────────────────────────────

describe('updateQuantity', () => {
  it('augmente la quantité avec delta positif', () => {
    addToCart(baseItem);
    updateQuantity(1, 'monthly', +2);
    expect(getCart()[0].quantity).toBe(3);
  });

  it('diminue la quantité avec delta négatif', () => {
    addToCart(baseItem);
    addToCart(baseItem); // quantity = 2
    updateQuantity(1, 'monthly', -1);
    expect(getCart()[0].quantity).toBe(1);
  });

  it('ne descend pas en dessous de 1', () => {
    addToCart(baseItem); // quantity = 1
    updateQuantity(1, 'monthly', -5);
    expect(getCart()[0].quantity).toBe(1);
  });

  it("ne fait rien si l'item n'existe pas", () => {
    addToCart(baseItem);
    updateQuantity(99, 'monthly', +1);
    expect(getCart()[0].quantity).toBe(1);
  });

  it('cible le bon item par id ET durée', () => {
    addToCart(baseItem);
    addToCart({ ...baseItem, duration: 'annual' });
    updateQuantity(1, 'annual', +3);
    const cart = getCart();
    const monthly = cart.find(i => i.duration === 'monthly')!;
    const annual  = cart.find(i => i.duration === 'annual')!;
    expect(monthly.quantity).toBe(1);
    expect(annual.quantity).toBe(4);
  });
});

// ── removeFromCart ────────────────────────────────────────────────────────

describe('removeFromCart', () => {
  it("supprime l'item par id + durée", () => {
    addToCart(baseItem);
    removeFromCart(1, 'monthly');
    expect(getCart()).toHaveLength(0);
  });

  it('ne supprime pas un item avec la même durée mais id différent', () => {
    addToCart(baseItem);
    addToCart({ ...baseItem, id: 2, name: 'CYNA EDR' });
    removeFromCart(1, 'monthly');
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe(2);
  });

  it('ne supprime pas un item avec le même id mais durée différente', () => {
    addToCart(baseItem);
    addToCart({ ...baseItem, duration: 'annual' });
    removeFromCart(1, 'monthly');
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].duration).toBe('annual');
  });

  it("ne plante pas si l'item n'existe pas", () => {
    expect(() => removeFromCart(99, 'monthly')).not.toThrow();
  });
});

// ── clearCart ─────────────────────────────────────────────────────────────

describe('clearCart', () => {
  it('vide complètement le panier', () => {
    addToCart(baseItem);
    addToCart({ ...baseItem, id: 2, name: 'CYNA EDR' });
    clearCart();
    expect(getCart()).toEqual([]);
  });

  it('supprime la clé cyna_cart du localStorage', () => {
    addToCart(baseItem);
    clearCart();
    expect(localStorage.getItem('cyna_cart')).toBeNull();
  });
});

// ── getCartCount ──────────────────────────────────────────────────────────

describe('getCartCount', () => {
  it('retourne 0 pour un panier vide', () => {
    expect(getCartCount()).toBe(0);
  });

  it('retourne la quantité totale de tous les items', () => {
    addToCart(baseItem);
    addToCart(baseItem);                               // quantity = 2
    addToCart({ ...baseItem, id: 2, name: 'EDR' });  // quantity = 1
    expect(getCartCount()).toBe(3);
  });

  it('tient compte des quantités modifiées', () => {
    addToCart(baseItem);
    updateQuantity(1, 'monthly', +4); // quantity = 5
    expect(getCartCount()).toBe(5);
  });
});

// ── CATEGORY_COLORS ───────────────────────────────────────────────────────

describe('CATEGORY_COLORS', () => {
  it('contient la couleur SOC', () => {
    expect(CATEGORY_COLORS.SOC).toBe('#00B4D8');
  });

  it('contient la couleur EDR', () => {
    expect(CATEGORY_COLORS.EDR).toBe('#8B5CF6');
  });

  it('contient la couleur XDR', () => {
    expect(CATEGORY_COLORS.XDR).toBe('#10B981');
  });
});
