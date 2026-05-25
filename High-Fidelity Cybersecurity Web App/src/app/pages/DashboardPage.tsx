import { Link } from 'react-router';
import { LayoutDashboard, CreditCard, ShoppingBag, Settings, User, Calendar, CheckCircle } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    {
      label: 'Abonnements actifs',
      value: '3',
      icon: CheckCircle,
    },
    {
      label: 'Factures ce mois',
      value: '847€',
      icon: CreditCard,
    },
    {
      label: 'Prochain renouvellement',
      value: '15 mai',
      icon: Calendar,
    },
  ];

  const subscriptions = [
    {
      id: 1,
      name: 'Cyna SOC Premium',
      status: 'Actif',
      price: '1 299€',
      categoryColor: '#00B4D8',
    },
    {
      id: 2,
      name: 'Cyna EDR Enterprise',
      status: 'Actif',
      price: '899€',
      categoryColor: '#8B5CF6',
    },
    {
      id: 3,
      name: 'Cyna XDR Suite',
      status: 'Actif',
      price: '1 799€',
      categoryColor: '#10B981',
    },
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: 'Vue d\'ensemble', href: '/espace-client', active: true },
    { icon: ShoppingBag, label: 'Abonnements', href: '/espace-client/abonnements', active: false },
    { icon: CreditCard, label: 'Commandes', href: '/espace-client/commandes', active: false },
    { icon: Settings, label: 'Paramètres', href: '/espace-client/parametres', active: false },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00B4D8] to-[#0096B8] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">Jean Dupont</h3>
                <p className="text-sm text-gray-400">jean.dupont@entreprise.fr</p>
              </div>

              {/* Menu */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        item.active
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Vue d'ensemble</h1>
              <p className="text-gray-400">Gérez vos abonnements et suivez votre activité</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#00B4D8]/20 border border-[#00B4D8]/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#00B4D8]" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Active Subscriptions */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Abonnements actifs</h2>
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{sub.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full text-xs font-semibold">
                            {sub.status}
                          </span>
                          <span className="text-gray-400 text-sm">Facturation mensuelle</span>
                        </div>
                      </div>
                      <div className="text-right mr-6">
                        <div className="text-2xl font-bold text-[#00B4D8] mb-1">{sub.price}</div>
                        <div className="text-sm text-gray-400">/mois</div>
                      </div>
                      <Link
                        to={`/espace-client/abonnements/${sub.id}`}
                        className="px-6 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Gérer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
