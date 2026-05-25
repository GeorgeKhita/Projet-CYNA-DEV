import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: 'user' | 'admin';
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'cyna-auth' }
  )
);
