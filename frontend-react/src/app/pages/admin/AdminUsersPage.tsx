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
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-1">Utilisateurs</h1>
          <p className="text-muted-foreground">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-ink focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8] text-sm w-64" />
          </div>
          <button type="submit" className="btn btn-primary">Chercher</button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground"><div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />Chargement...</div>
      ) : (
        <div className="cyna-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-subtle">
                  {['Utilisateur', 'Email', 'Entreprise', 'Commandes', 'Abonnements', 'RÃ´le', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Aucun utilisateur</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-bg-subtle transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00B4D8]/15 border border-[#00B4D8]/30 flex items-center justify-center text-xs font-bold text-[#0098B7]">
                          {(u.first_name?.[0] ?? '') + (u.last_name?.[0] ?? '')}
                        </div>
                        <span className="text-ink text-sm font-semibold">{u.first_name} {u.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{u.email}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{u.company ?? 'â€”'}</td>
                    <td className="px-6 py-4 text-ink text-sm text-center">{u.orders_count}</td>
                    <td className="px-6 py-4 text-ink text-sm text-center">{u.subscriptions_count}</td>
                    <td className="px-6 py-4">
                      {u.role === 'admin'
                        ? <span className="flex items-center gap-1 text-[#B45309] text-xs font-semibold"><Shield className="w-3.5 h-3.5" />Admin</span>
                        : <span className="flex items-center gap-1 text-muted-foreground text-xs"><User className="w-3.5 h-3.5" />User</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDelete(u.id, u.email)}
                          className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors text-muted-foreground hover:text-[#EF4444]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
