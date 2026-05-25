import { Link } from 'react-router';
import { LayoutDashboard, CreditCard, ShoppingBag, Settings, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Props {
  active: 'overview' | 'orders' | 'settings';
}

export function DashboardSidebar({ active }: Props) {
  const user = useAuthStore((s) => s.user);

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: "Vue d'ensemble", href: '/espace-client' },
    { id: 'orders',   icon: CreditCard,      label: 'Commandes',       href: '/espace-client/commandes' },
    { id: 'settings', icon: Settings,         label: 'Paramètres',      href: '/espace-client/parametres' },
  ] as const;

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 sticky top-24">
      {/* User Info */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#00B4D8] to-[#0096B8] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-1">
          {user ? `${user.firstName} ${user.lastName}` : '—'}
        </h3>
        <p className="text-sm text-gray-400">{user?.email}</p>
        {user?.company && (
          <p className="text-xs text-gray-500 mt-1">{user.company}</p>
        )}
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
