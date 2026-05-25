import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../store/authStore';

/** Protège les routes admin — vérifie le rôle admin dans le store */
export function AdminGuard() {
  const user = useAuthStore((s) => s.user);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
