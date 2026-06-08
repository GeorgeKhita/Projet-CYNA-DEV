import { Link, useLocation } from 'react-router';
import { LayoutDashboard, CreditCard, ShoppingBag, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: '/espace-client' },
  { icon: ShoppingBag,     label: 'Abonnements',    href: '/espace-client/abonnements' },
  { icon: CreditCard,      label: 'Commandes',       href: '/espace-client/commandes' },
  { icon: Settings,        label: 'Paramètres',      href: '/espace-client/parametres' },
];

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 sticky top-24">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#00B4D8] to-[#0096B8] rounded-full flex items-center justify-center mx-auto mb-4">
          {initials
            ? <span className="text-white text-2xl font-bold">{initials}</span>
            : <User className="w-10 h-10 text-white" />
          }
        </div>
        <h3 className="text-xl font-semibold text-white mb-1">{user?.first_name} {user?.last_name}</h3>
        <p className="text-sm text-gray-400">{user?.email}</p>
        {user?.company && <p className="text-xs text-gray-500 mt-1">{user.company}</p>}
      </div>

      <nav className="space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left mt-2">
          <span className="font-medium">Se déconnecter</span>
        </button>
      </nav>
    </div>
  );
}
