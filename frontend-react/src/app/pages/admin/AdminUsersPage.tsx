import { useState, useEffect } from 'react';
import { Search, Trash2, Shield, User } from 'lucide-react';
import { api } from '../../../api/client';

interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  role: string;
  orders_count: number;
  subscriptions_count: number;
  created_at: string;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  function fetchUsers(q = '') {
    setLoading(true);
    api.get<any>(`/admin/users${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then(d => setUsers(d.data ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchUsers(search);
  }

  async function handleDelete(id: number, email: string) {
    if (!confirm(`Supprimer ${email} ?`)) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(u => u.filter(x => x.id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Utilisateurs</h1>
          <p className="text-gray-400">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] text-sm w-64" />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-sm hover:bg-[#0096B8]">Chercher</button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-400"><div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />Chargement...</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Utilisateur', 'Email', 'Entreprise', 'Commandes', 'Abonnements', 'Rôle', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun utilisateur</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00B4D8]/20 border border-[#00B4D8]/30 flex items-center justify-center text-xs font-bold text-[#00B4D8]">
                        {(u.first_name?.[0] ?? '') + (u.last_name?.[0] ?? '')}
                      </div>
                      <span className="text-white text-sm font-medium">{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{u.company ?? '—'}</td>
                  <td className="px-6 py-4 text-white text-sm text-center">{u.orders_count}</td>
                  <td className="px-6 py-4 text-white text-sm text-center">{u.subscriptions_count}</td>
                  <td className="px-6 py-4">
                    {u.role === 'admin'
                      ? <span className="flex items-center gap-1 text-[#F59E0B] text-xs font-semibold"><Shield className="w-3.5 h-3.5" />Admin</span>
                      : <span className="flex items-center gap-1 text-gray-400 text-xs"><User className="w-3.5 h-3.5" />User</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDelete(u.id, u.email)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
