import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../../context/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';

export function AdminLayout() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/connexion" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
