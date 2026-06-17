import { Navigate, Outlet, useLocation } from 'react-router';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';

export function AdminLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-subtle flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/connexion" replace />;
  }

  // 2FA obligatoire pour tout le backoffice
  const has2FA = user?.two_factor_enabled === true;
  const isOnSecurityPage = location.pathname === '/admin/securite';

  if (!has2FA && !isOnSecurityPage) {
    return (
      <div className="min-h-screen bg-bg-subtle flex">
        <AdminSidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 border border-destructive/30 rounded-2xl mb-6">
              <ShieldOff className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-3">Authentification forte requise</h1>
            <p className="text-muted-foreground mb-6">
              L'accès au backoffice CYNA nécessite une authentification à deux facteurs (2FA) active sur votre compte administrateur.
            </p>
            <a
              href="/admin/securite"
              className="btn btn-primary btn-lg inline-flex"
            >
              Configurer la 2FA maintenant
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-subtle flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
