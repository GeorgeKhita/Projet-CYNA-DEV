import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setToken, clearToken, getToken } from '../api/client';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem('cyna_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        clearToken();
        localStorage.removeItem('cyna_user');
      }
    }
    setLoading(false);
  }, []);

  function login(token: string, userData: User) {
    setToken(token);
    localStorage.setItem('cyna_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    clearToken();
    localStorage.removeItem('cyna_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
