const CART_KEY = 'cyna_cart';

export interface CartItem {
  id: number;
  name: string;
  category: string;
  categoryColor?: string;
  price: number;
  duration: 'monthly' | 'annual';
  quantity: number;
  maxStock?: number;
}

export const CATEGORY_COLORS: Record<string, string> = {
  SOC: '#00B4D8',
  EDR: '#8B5CF6',
  XDR: '#10B981',
};

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

// Retourne false si le stock est insuffisant
export function addToCart(item: Omit<CartItem, 'quantity'>): boolean {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && i.duration === item.duration);
  const withColor = {
    ...item,
    categoryColor: item.categoryColor ?? CATEGORY_COLORS[item.category] ?? '#00B4D8',
  };

  if (existing) {
    if (item.maxStock !== undefined && existing.quantity >= item.maxStock) return false;
    existing.quantity += 1;
  } else {
    if (item.maxStock !== undefined && item.maxStock <= 0) return false;
    cart.push({ ...withColor, quantity: 1 });
  }
  saveCart(cart);
  return true;
}

export function updateQuantity(id: number, duration: string, delta: number): void {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.duration === duration);
  if (!item) return;
  const newQty = item.quantity + delta;
  if (newQty < 1) return;
  if (delta > 0 && item.maxStock !== undefined && newQty > item.maxStock) return;
  item.quantity = newQty;
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
