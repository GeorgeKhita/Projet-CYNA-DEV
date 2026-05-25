import { Link } from 'react-router';
import { LayoutDashboard, CreditCard, ShoppingBag, Settings, User, Download, FileText } from 'lucide-react';

const orders = [
  {
    id: 'CYN-2026-0042',
    product: 'Cyna SOC Premium',
    date: '12 mai 2026',
    plan: 'Mensuel',
    amount: '1 299€',
    status: 'Actif' as const,
  },
  {
    id: 'CYN-2026-0031',
    product: 'Cyna EDR Enterprise',
    date: '01 avril 2026',
    plan: 'Annuel',
    amount: '8 952€',
    status: 'Actif' as const,
  },
  {
    id: 'CYN-2025-0198',
    product: 'Cyna XDR Suite',
    date: '15 novembre 2025',
    plan: 'Mensuel',
    amount: '1 799€',
    status: 'En attente' as const,
  },
  {
    id: 'CYN-2025-0112',
    product: 'Cyna SOC Essentials',
    date: '03 juillet 2025',
    plan: 'Mensuel',
    amount: '699€',
    status: 'Actif' as const,
  },
];

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: '/espace-client', active: false },
  { icon: ShoppingBag, label: 'Abonnements', href: '/espace-client', active: false },
  { icon: CreditCard, label: 'Commandes', href: '/espace-client/commandes', active: true },
  { icon: Settings, label: 'Paramètres', href: '/espace-client/parametres', active: false },
];

export function DashboardOrdersPage() {
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
              <h1 className="text-4xl font-bold text-white mb-2">Mes commandes</h1>
              <p className="text-gray-400">Historique de toutes vos commandes et factures</p>
            </div>

            {/* Orders Table */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#00B4D8]" />
                <h2 className="text-lg font-semibold text-white">Historique des commandes</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">ID Commande</th>
                      <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Produit</th>
                      <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Date</th>
                      <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Plan</th>
                      <th className="text-right px-6 py-4 text-gray-400 text-sm font-medium">Montant</th>
                      <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Statut</th>
                      <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Facture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-[#00B4D8] font-mono text-sm font-semibold">{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{order.product}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm">{order.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 font-medium">
                            {order.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-white font-semibold">{order.amount}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {order.status === 'Actif' ? (
                            <span className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full text-xs font-semibold">
                              Actif
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 rounded-full text-xs font-semibold">
                              En attente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="flex items-center gap-1.5 mx-auto px-3 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-[#00B4D8]/20 hover:border-[#00B4D8]/40 hover:text-[#00B4D8] transition-all text-sm font-medium">
                            <Download className="w-4 h-4" />
                            Télécharger
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
