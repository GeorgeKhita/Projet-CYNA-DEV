import { create } from 'zustand';

export interface BillingAddress {
  company: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

interface CheckoutStore {
  billingAddress: BillingAddress | null;
  lastOrderId: number | null;
  lastOrderRef: string | null;
  setBillingAddress: (addr: BillingAddress) => void;
  setLastOrder: (id: number, ref: string) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  billingAddress: null,
  lastOrderId: null,
  lastOrderRef: null,
  setBillingAddress: (addr) => set({ billingAddress: addr }),
  setLastOrder: (id, ref) => set({ lastOrderId: id, lastOrderRef: ref }),
  reset: () => set({ billingAddress: null, lastOrderId: null, lastOrderRef: null }),
}));
