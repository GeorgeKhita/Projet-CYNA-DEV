import axiosInstance from './axiosInstance';

export interface Subscription {
  id: number;
  product: {
    id: number;
    name: string;
    category: string;
  };
  plan: 'monthly' | 'annual';
  status: 'active' | 'cancelled' | 'expired';
  price: number;
  started_at: string | null;
  ends_at: string | null;
  next_billing_date?: string;
  created_at: string;
}

/** GET /api/subscriptions */
export async function getMySubscriptions(): Promise<Subscription[]> {
  const { data } = await axiosInstance.get<Subscription[]>('/subscriptions');
  return data;
}

/** PATCH /api/subscriptions/{id}/cancel */
export async function cancelSubscription(id: number): Promise<{ message: string }> {
  const { data } = await axiosInstance.patch(`/subscriptions/${id}/cancel`);
  return data;
}
