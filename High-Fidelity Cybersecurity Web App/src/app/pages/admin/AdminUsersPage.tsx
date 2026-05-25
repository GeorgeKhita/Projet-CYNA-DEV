import { useState } from 'react';
import { Search, UserCheck, UserX, Shield, Mail, Building, MoreVertical } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: 'admin' | 'user';
  active: boolean;
  subscriptions: number;
  joinDate: string;
}

const USERS: User[] = [
  { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@techcorp.fr', company: 'TechCorp SA', role: 'user', active: true, subscriptions: 3, joinDate: '12/01/2026' },
  { id: 2, firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@infosec.co.uk', company: 'InfoSec Ltd', role: 'user', active: true, subscriptions: 1, joinDate: '05/02/2026' },
  { id: 3, firstName: 'Paul', lastName: 'Bernard', email: 'p.bernard@datashield.fr', company: 'DataShield FR', role: 'user', active: false, subscriptions: 2, joinDate: '20/02/2026' },
  { id: 4, firstName: 'Sophie', lastName: 'Leclerc', email: 'sleclerc@securepme.fr', company: 'SecurePME', role: 'user', active: true, subscriptions: 1, joinDate: '01/03/2026' },
  { id: 5, firstName: 'Admin', lastName: 'CYNA', email: 'admin@cyna-it.fr', company: 'CYNA-IT', role: 'admin', active: true, subscriptions: 0, joinDate: '01/01/2026' },
  { id: 6, firstName: 'Lucas', lastName: 'Moreau', email: 'lucas@globalsec.com', company: 'GlobalSec', role: 'user', active: true, subscriptions: 2, joinDate: '10/03/2026' },
  { id: 7, firstName: 'Emma', lastName: 'Petit', email: 'emma.petit@cyberguard.fr', company: 'CyberGuard', role: 'user', active: false, subscriptions: 0, joinDate: '15/04/2026' },
];

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(USERS);

  const filtered = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.company.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: number) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const activeCount = users.filter((u) => u.active && u.role === 'user').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Utilisateurs</h1>
          <p className="text-gray-400">
            {activeCount} actif{activeCount > 1 ? 's' : ''} · {adminCount} admin{adminCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total utilisateurs', value: users.length, color: '#00B4D8' },
          { label: 'Comptes actifs', value: users.filter((u) => u.active).length, color: '#10B981' },
          { label: 'Comptes inactifs', value: users.filter((u) => !u.active).length, color: '#EF4444' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
        />
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Utilisateur</th>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Entreprise</th>
              <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Rôle</th>
              <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Abonnements</th>
              <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Statut</th>
              <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00B4D8]/30 to-[#8B5CF6]/30 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Building className="w-4 h-4 text-gray-500" />
                    {user.company}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">Depuis le {user.joinDate}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 rounded-full text-xs font-semibold">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-gray-400 border border-white/20 rounded-full text-xs font-semibold">
                      Utilisateur
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[#00B4D8] font-semibold">{user.subscriptions}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {user.active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 rounded-full text-xs font-semibold">
                      <UserCheck className="w-3 h-3" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 rounded-full text-xs font-semibold">
                      <UserX className="w-3 h-3" />
                      Inactif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleActive(user.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto transition-colors border ${
                      user.active
                        ? 'bg-[#EF4444]/10 border-[#EF4444]/30 hover:bg-[#EF4444]/20'
                        : 'bg-[#10B981]/10 border-[#10B981]/30 hover:bg-[#10B981]/20'
                    }`}
                    title={user.active ? 'Désactiver' : 'Activer'}
                  >
                    {user.active ? (
                      <UserX className="w-4 h-4 text-[#EF4444]" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-[#10B981]" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500">Aucun utilisateur trouvé</div>
        )}
      </div>
    </div>
  );
}
