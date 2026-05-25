import axiosInstance from './axiosInstance';

export interface OrderItem {
  product_id: number;
  product_name?: string;
  plan: 'monthly' | 'annual';
  price: number;
}

export interface Order {
  id: number;
  ref?: string;
  client?: string;
  email?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  created_at: string;
}

export interface CreateOrderPayload {
  items: {
    product_id: number;
    plan: 'monthly' | 'annual';
    price: number;
  }[];
  total: number;
  billing_address?: {
    company?: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export interface PaginatedOrders {
  data: Order[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

/** GET /api/orders — commandes de l'utilisateur connecté */
export async function getMyOrders(): Promise<Order[]> {
  const { data } = await axiosInstance.get<Order[]>('/orders');
  return data;
}

/** POST /api/orders — créer une commande */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await axiosInstance.post<Order>('/orders', payload);
  return data;
}

/** GET /api/orders/:id */
export async function getOrder(id: number): Promise<Order> {
  const { data } = await axiosInstance.get<Order>(`/orders/${id}`);
  return data;
}

// ── Admin ────────────────────────────────────────────────────────────────

/** GET /api/admin/orders */
export async function adminGetOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<PaginatedOrders> {
  const { data } = await axiosInstance.get<PaginatedOrders>('/admin/orders', { params });
  return data;
}

/** PATCH /api/admin/orders/:id/status */
export async function adminUpdateOrderStatus(
  id: number,
  status: Order['status']
): Promise<Order> {
  const { data } = await axiosInstance.patch<Order>(`/admin/orders/${id}/status`, { status });
  return data;
}
