import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { LifeBuoy, Plus, Send, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';

interface TicketMessage { id: number; message: string; from: 'user' | 'admin'; created_at: string; }
interface Ticket {
  id: number; subject: string; status: string; priority: string;
  messages_count: number; created_at: string; messages?: TicketMessage[];
}

const STATUS_COLORS: Record<string, string> = {
  open:        '#00B4D8',
  in_progress: '#F59E0B',
  resolved:    '#10B981',
  closed:      '#64748b',
};

export function TicketsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [tickets, setTickets]       = useState<Ticket[]>([]);
  const [loading, setLoading]       = useState(true);
  const [openId, setOpenId]         = useState<number | null>(null);
  const [detail, setDetail]         = useState<Ticket | null>(null);
  const [replyMsg, setReplyMsg]     = useState('');
  const [sending, setSending]       = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' });
  const [creating, setCreating]     = useState(false);

  const priorityOptions = [
    { value: 'low',    label: t('support.priority_low') },
    { value: 'normal', label: t('support.priority_normal') },
    { value: 'high',   label: t('support.priority_high') },
    { value: 'urgent', label: t('support.priority_urgent') },
  ];

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<Ticket[]>('/tickets')
      .then(data => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function openTicket(id: number) {
    if (openId === id) { setOpenId(null); setDetail(null); return; }
    setOpenId(id);
    try {
      const data = await api.get<Ticket>(`/tickets/${id}`);
      setDetail(data);
    } catch { setDetail(null); }
  }

  async function handleReply(ticketId: number) {
    if (!replyMsg.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${ticketId}/messages`, { message: replyMsg });
      const updated = await api.get<Ticket>(`/tickets/${ticketId}`);
      setDetail(updated);
      setReplyMsg('');
    } catch { alert('Erreur lors de l\'envoi.'); }
    finally { setSending(false); }
  }

  async function handleCreate() {
    if (!form.subject.trim() || !form.message.trim()) return;
    setCreating(true);
    try {
      const ticket = await api.post<Ticket>('/tickets', form);
      setTickets(prev => [{ ...ticket, messages_count: 1 }, ...prev]);
      setShowCreate(false);
      setForm({ subject: '', message: '', priority: 'normal' });
    } catch { alert('Erreur lors de la création.'); }
    finally { setCreating(false); }
  }

  if (authLoading) return <div className="min-h-screen bg-card flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-ink mb-1">{t('support.title')}</h1>
                <p className="text-muted-foreground">
                  {tickets.length === 1
                    ? t('support.subtitle_singular', { count: tickets.length })
                    : t('support.subtitle_plural', { count: tickets.length })}
                </p>
              </div>
              <button onClick={() => setShowCreate(v => !v)} className="btn btn-primary">
                <Plus className="w-4 h-4" /> {t('support.new_ticket')}
              </button>
            </div>

            {showCreate && (
              <div className="cyna-card p-6 space-y-4">
                <h2 className="text-xl font-bold text-ink">{t('support.create_ticket')}</h2>
                <div>
                  <label className="block text-ink mb-1 text-sm">{t('support.subject_label')}</label>
                  <input className="field" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder={t('support.subject_placeholder')} />
                </div>
                <div>
                  <label className="block text-ink mb-1 text-sm">{t('support.priority_label')}</label>
                  <select className="field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-ink mb-1 text-sm">{t('support.message_label')}</label>
                  <textarea className="field resize-none" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder={t('support.message_placeholder')} />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleCreate} disabled={creating} className="btn btn-primary">
                    <Send className="w-4 h-4" /> {creating ? t('support.sending') : t('support.send')}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="btn btn-ghost">{t('support.cancel')}</button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground py-8">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /> {t('support.loading')}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16 cyna-card">
                <LifeBuoy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t('support.no_tickets')}</p>
                <button onClick={() => setShowCreate(true)} className="btn btn-primary">{t('support.create_first')}</button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map(ticket => {
                  const color = STATUS_COLORS[ticket.status] ?? '#64748b';
                  const statusLabel = t(`support.status_${ticket.status}`) || ticket.status;
                  const priorityLabel = priorityOptions.find(o => o.value === ticket.priority)?.label ?? ticket.priority;
                  const isOpen = openId === ticket.id;
                  return (
                    <div key={ticket.id} className="cyna-card overflow-hidden">
                      <button onClick={() => openTicket(ticket.id)} className="w-full p-5 flex items-center gap-4 text-left hover:bg-bg-subtle/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <span className="font-bold text-ink">#{ticket.id} — {ticket.subject}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold border" style={{ color, borderColor: `${color}40`, backgroundColor: `${color}12` }}>{statusLabel}</span>
                            <span className="text-xs text-muted-foreground">{priorityLabel}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(ticket.created_at).toLocaleDateString()} — {ticket.messages_count} {ticket.messages_count === 1 ? t('support.subtitle_singular', { count: 1 }).replace('1 ', '') : t('support.subtitle_plural', { count: ticket.messages_count }).replace(`${ticket.messages_count} `, '')}
                          </div>
                        </div>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-border p-5 space-y-4">
                          {detail?.messages ? (
                            <>
                              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {detail.messages.map(msg => (
                                  <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.from === 'admin' ? 'bg-bg-subtle border border-border text-ink' : 'bg-[#00B4D8]/12 border border-[#00B4D8]/25 text-ink'}`}>
                                      <div className="font-semibold text-xs mb-1 text-muted-foreground">{msg.from === 'admin' ? t('support.admin_label') : t('support.you_label')}</div>
                                      <p className="whitespace-pre-wrap">{msg.message}</p>
                                      <div className="text-xs text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleString()}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {!['resolved', 'closed'].includes(ticket.status) && (
                                <div className="flex gap-3 pt-2">
                                  <textarea className="field resize-none flex-1" rows={2} value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder={t('support.reply_placeholder')} />
                                  <button onClick={() => handleReply(ticket.id)} disabled={sending || !replyMsg.trim()} className="btn btn-primary self-end">
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
