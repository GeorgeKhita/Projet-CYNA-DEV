import { Link, useLocation } from 'react-router';
import { LayoutDashboard, CreditCard, ShoppingBag, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: '/espace-client' },
  { icon: ShoppingBag,     label: 'Abonnements',    href: '/espace-client/abonnements' },
  { icon: CreditCard,      label: 'Commandes',       href: '/espace-client/commandes' },
  { icon: Settings,        label: 'ParamÃ¨tres',      href: '/espace-client/parametres' },
];

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div className="cyna-card p-6 sticky top-24">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#00B4D8] to-[#0098B7] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_10px_24px_rgba(0,180,216,0.3)]">
          {initials
            ? <span className="text-white text-2xl font-bold">{initials}</span>
            : <User className="w-10 h-10 text-white" />
          }
        </div>
        <h3 className="text-xl font-bold text-ink mb-1">{user?.first_name} {user?.last_name}</h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        {user?.company && <p className="text-xs text-muted-foreground mt-1">{user.company}</p>}
      </div>

      <nav className="space-y-1.5">
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? 'bg-[#00B4D8]/12 text-[#0098B7] border border-[#00B4D8]/30'
                  : 'text-muted-foreground hover:bg-bg-subtle hover:text-ink'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#FEF2F2] transition-colors text-left mt-2">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Se dÃ©connecter</span>
        </button>
      </nav>
    </div>
  );
}
