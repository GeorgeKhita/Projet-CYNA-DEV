import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  LogOut,
  Shield,
  Activity,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Package, label: 'Produits', href: '/admin/produits' },
  { icon: Tag, label: 'Catégories', href: '/admin/categories' },
  { icon: ShoppingBag, label: 'Commandes', href: '/admin/commandes' },
  { icon: Users, label: 'Utilisateurs', href: '/admin/utilisateurs' },
  { icon: Activity, label: 'Logs', href: '/admin/logs' },
  { icon: Settings, label: 'Paramètres', href: '/admin/parametres' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => navigate('/admin');

  return (
    <div className="min-h-screen bg-[#060E1E] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A1628] border-r border-white/10 flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00B4D8]" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">CYNA</div>
              <div className="text-[#00B4D8] text-xs font-medium">Administration</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-[#00B4D8] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00B4D8] to-[#8B5CF6] rounded-full flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Admin CYNA</div>
              <div className="text-gray-500 text-xs truncate">admin@cyna-it.fr</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-[#EF4444] transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#0A1628] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-300" />
            )}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-gray-400 text-sm">Système opérationnel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
