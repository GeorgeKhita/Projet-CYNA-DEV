import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, Package, Users, ShoppingCart, MessageSquare, LogOut, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/admin' },
  { icon: Package,         label: 'Produits',     href: '/admin/produits' },
  { icon: Users,           label: 'Utilisateurs', href: '/admin/utilisateurs' },
  { icon: ShoppingCart,    label: 'Commandes',    href: '/admin/commandes' },
  { icon: MessageSquare,   label: 'Messages',     href: '/admin/messages' },
  { icon: ShieldCheck,     label: 'Sécurité 2FA', href: '/admin/securite' },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/connexion');
  }

  return (
    <aside className="w-64 bg-[#0d1f3c] border-r border-white/10 min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00B4D8]/20 border border-[#00B4D8]/40 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#00B4D8]" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">CYNA Admin</div>
            <div className="text-gray-500 text-xs">Panel d'administration</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
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
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors text-sm">
          Voir le site
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm">
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
