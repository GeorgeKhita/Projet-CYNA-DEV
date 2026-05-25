import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  role: 'user' | 'admin';
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  /** Alias for login — called after API response */
  setUser: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      login:   (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('cyna_token');
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'cyna-auth-storage' }
  )
);
