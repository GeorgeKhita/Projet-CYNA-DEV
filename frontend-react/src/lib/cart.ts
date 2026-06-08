const CART_KEY = 'cyna_cart';

export interface CartItem {
  id: number;
  name: string;
  category: string;
  categoryColor: string;
  price: number;
  duration: 'monthly' | 'annual';
  quantity: number;
}

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: Omit<CartItem, 'quantity'>): void {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && i.duration === item.duration);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  saveCart(cart);
}

export function updateQuantity(id: number, duration: string, delta: number): void {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.duration === duration);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
  }
  saveCart(cart);
}

export function removeFromCart(id: number, duration: string): void {
  saveCart(getCart().filter(i => !(i.id === id && i.duration === duration)));
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export const CATEGORY_COLORS: Record<string, string> = {
  SOC: '#00B4D8',
  EDR: '#8B5CF6',
  XDR: '#10B981',
};
