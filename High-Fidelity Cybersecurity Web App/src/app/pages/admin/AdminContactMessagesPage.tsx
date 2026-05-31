import { useEffect, useState } from 'react';
import { Mail, Search, Eye, Trash2, Loader2, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

interface ContactMessage {
  id: number;
  name: string | null;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface PaginatedMessages {
  data: ContactMessage[];
  current_page: number;
  last_page: number;
  total: number;
  unread_count: number;
}

export function AdminContactMessagesPage() {
  const [data, setData]             = useState<PaginatedMessages | null>(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data: res } = await axiosInstance.get<PaginatedMessages>('/admin/contact-messages', {
        params: { search: search || undefined, status: statusFilter || undefined, page },
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMessages();
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.is_read) {
      await axiosInstance.patch(`/admin/contact-messages/${msg.id}/read`);
      setData((prev) => prev ? {
        ...prev,
        data: prev.data.map((m) => m.id === msg.id ? { ...m, is_read: true } : m),
        unread_count: Math.max(0, prev.unread_count - 1),
      } : null);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Supprimer ce message ?')) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/admin/contact-messages/${id}`);
      setData((prev) => prev ? {
        ...prev,
        data: prev.data.filter((m) => m.id !== id),
        total: prev.total - 1,
      } : null);
      if (selected?.id === id) setSelected(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Messages de contact</h1>
          <p className="text-gray-400 mt-1">
            {data ? `${data.total} message${data.total > 1 ? 's' : ''} · ${data.unread_count} non lu${data.unread_count > 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        {data && data.unread_count > 0 && (
          <span className="px-3 py-1 bg-[#00B4D8] text-[#0A1628] font-bold rounded-full text-sm">
            {data.unread_count} non lu{data.unread_count > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-4 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email, nom, sujet…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-sm hover:bg-[#0096B8] transition-colors">
            Rechercher
          </button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          >
            <option value="">Tous</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-2">
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />Chargement…
            </div>
          )}
          {!loading && data?.data.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Mail className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              Aucun message trouvé.
            </div>
          )}
          {!loading && data?.data.map((msg) => (
            <button
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected?.id === msg.id
                  ? 'border-[#00B4D8]/50 bg-[#00B4D8]/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  {!msg.is_read && (
                    <span className="w-2 h-2 bg-[#00B4D8] rounded-full flex-shrink-0 mt-1" />
                  )}
                  <span className={`font-semibold text-sm truncate ${msg.is_read ? 'text-gray-300' : 'text-white'}`}>
                    {msg.name || msg.email}
                  </span>
                </div>
                <span className="text-gray-500 text-xs flex-shrink-0">
                  {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-gray-400 text-sm truncate">{msg.subject}</p>
              <p className="text-gray-500 text-xs truncate mt-1">{msg.message}</p>
            </button>
          ))}

          {/* Pagination */}
          {data && data.last_page > 1 && (
            <div className="flex gap-2 pt-2">
              {Array.from({ length: data.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    page === p ? 'bg-[#00B4D8] text-[#0A1628]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Détail message */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selected.subject}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>De : <span className="text-white">{selected.name || '—'}</span></span>
                    <span>·</span>
                    <a href={`mailto:${selected.email}`} className="text-[#00B4D8] hover:underline">{selected.email}</a>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Reçu le {new Date(selected.created_at).toLocaleString('fr-FR')}
                    {selected.is_read && selected.read_at && (
                      <span> · Lu le {new Date(selected.read_at).toLocaleString('fr-FR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {selected.is_read
                    ? <CheckCircle className="w-5 h-5 text-[#10B981]" />
                    : <AlertCircle className="w-5 h-5 text-[#00B4D8]" />
                  }
                  <button
                    onClick={() => deleteMessage(selected.id)}
                    disabled={deletingId === selected.id}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    {deletingId === selected.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              <div className="bg-black/20 border border-white/5 rounded-lg p-5 text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                {selected.message}
              </div>

              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Répondre par email
              </a>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-gray-500 h-full flex flex-col items-center justify-center">
              <Eye className="w-12 h-12 mb-3 text-gray-700" />
              <p>Sélectionnez un message pour le lire</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
