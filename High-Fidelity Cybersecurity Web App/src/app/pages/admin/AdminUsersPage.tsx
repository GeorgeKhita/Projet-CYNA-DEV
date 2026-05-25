import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { adminGetUsers, adminToggleUser, adminDeleteUser, type AdminUser } from '../../api/admin';

export function AdminUsersPage() {
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminGetUsers({ search: search || undefined })
      .then((r) => setUsers(r.data))
      .catch(() => setError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleToggle = async (id: number) => {
    try { await adminToggleUser(id); load(); }
    catch { alert('Erreur lors de la mise à jour.'); }
  };

  const handleDelete = async (id: number) => {
    try { await adminDeleteUser(id); setDeleteId(null); load(); }
    catch { alert('Erreur lors de la suppression.'); }
  };

  const activeCount = users.filter((u) => u.is_active && u.role === 'user').length;
  const adminCount  = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Utilisateurs</h1>
          <p className="text-gray-400">{users.length} utilisateurs enregistrés</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center">
            <div className="text-2xl font-bold text-[#10B981]">{activeCount}</div>
            <div className="text-xs text-gray-400">Clients actifs</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center">
            <div className="text-2xl font-bold text-[#8B5CF6]">{adminCount}</div>
            <div className="text-xs text-gray-400">Admins</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          type="text" placeholder="Rechercher un utilisateur..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
      </div>

      {loading && <div className="flex items-center gap-3 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin" />Chargement...</div>}
      {error && <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4"><AlertCircle className="w-5 h-5 text-red-400" /><span className="text-red-400">{error}</span></div>}

      {!loading && (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Utilisateur', 'Email', 'Entreprise', 'Rôle', 'Abonnements', 'Inscription', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-gray-400 text-sm font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${!u.is_active ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="text-white font-medium">{u.first_name} {u.last_name}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{u.email}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{u.company ?? '—'}</td>
                  <td className="px-5 py-4">
                    {u.role === 'admin' ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded-full text-xs font-semibold w-fit">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-white/5 text-gray-400 border border-white/10 rounded-full text-xs font-semibold">
                        Client
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-white text-sm">{u.subscriptions_count}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(u.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        u.is_active
                          ? 'text-[#10B981] bg-[#10B981]/20 border-[#10B981]/30 hover:bg-[#10B981]/30'
                          : 'text-red-400 bg-red-400/20 border-red-400/30 hover:bg-red-400/30'
                      }`}>
                      {u.is_active ? <><UserCheck className="w-3 h-3" />Actif</> : <><UserX className="w-3 h-3" />Inactif</>}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    {u.role !== 'admin' && (
                      <button onClick={() => setDeleteId(u.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1F3A] border border-white/10 rounded-xl p-8 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Supprimer cet utilisateur ?</h3>
            <p className="text-gray-400 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-white/10 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
