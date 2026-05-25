import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useAuthStore } from './store/authStore';
import { getMe } from './api/auth';

export default function App() {
  const { isAuthenticated, logout, setUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cyna_token');

    if (!token || !isAuthenticated) {
      // Pas de token → on s'assure que le store est propre
      logout();
      setChecking(false);
      return;
    }

    // Token présent → on vérifie côté serveur
    getMe()
      .then((user) => {
        setUser({
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          company: user.company ?? undefined,
          phone: user.phone ?? undefined,
          role: user.role,
        });
      })
      .catch(() => {
        // Token invalide ou expiré → déconnexion silencieuse
        logout();
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}