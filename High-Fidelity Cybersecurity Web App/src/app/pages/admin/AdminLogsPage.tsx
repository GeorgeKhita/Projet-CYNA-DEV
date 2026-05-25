import { useEffect, useState } from 'react';
import { Search, Shield, UserCheck, Settings, ShoppingBag, AlertTriangle, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminGetLogs, type ActivityLog } from '../../api/admin';

const ACTION_ICONS: Record<string, React.ElementType> = {
  login: UserCheck, logout: UserCheck, product: ShoppingBag,
  order: ShoppingBag, settings: Settings, security: Shield, default: AlertTriangle,
};

const getIcon = (action: string): React.ElementType => {
  const key = Object.keys(ACTION_ICONS).find((k) => action.toLowerCase().includes(k));
  return ACTION_ICONS[key ?? 'default'];
};

export function AdminLogsPage() {
  const [logs, setLogs]       = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [type, setType]       = useState('all');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const PER_PAGE = 20;

  const load = () => {
    setLoading(true);
    adminGetLogs({ search: search || undefined, type: type !== 'all' ? type : undefined, page })
      .then((r) => { setLogs(r.data); setTotal(r.total); })
      .catch(() => setError('Impossible de charger les logs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, type, page]);

  const lastPage = Math.ceil(total / PER_PAGE) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-1">Logs d'activité</h1>
        <p className="text-gray-400">{total} événements enregistrés</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            type="text" placeholder="Rechercher dans les logs..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
        </div>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]">
          <option value="all" className="bg-[#0F1F3A]">Tous les types</option>
          <option value="auth" className="bg-[#0F1F3A]">Authentification</option>
          <option value="product" className="bg-[#0F1F3A]">Produits</option>
          <option value="order" className="bg-[#0F1F3A]">Commandes</option>
          <option value="security" className="bg-[#0F1F3A]">Sécurité</option>
        </select>
      </div>

      {loading && <div className="flex items-center gap-3 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin" />Chargement...</div>}
      {error && <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4"><AlertCircle className="w-5 h-5 text-red-400" /><span className="text-red-400">{error}</span></div>}

      {!loading && (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {logs.length === 0 && <div className="text-center py-12 text-gray-400">Aucun log trouvé.</div>}
            {logs.map((log) => {
              const Icon = getIcon(log.action);
              return (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 bg-[#00B4D8]/10 border border-[#00B4D8]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium">{log.action}</span>
                      {log.user_id && <span className="text-xs text-gray-500">user #{log.user_id}</span>}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{log.detail}</p>
                    <p className="text-xs text-gray-600 mt-1">IP : {log.ip_address}</p>
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
          {lastPage > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <span className="text-sm text-gray-400">Page {page} / {lastPage}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-40 hover:bg-white/5 rounded-lg">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-40 hover:bg-white/5 rounded-lg">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
