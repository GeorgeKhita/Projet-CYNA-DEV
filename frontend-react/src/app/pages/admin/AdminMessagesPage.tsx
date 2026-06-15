import { useState, useEffect } from 'react';
import { MessageSquare, Bot, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../../api/client';

interface Message {
  id: number;
  type: string;
  email: string;
  subject?: string;
  message_body: string;
  requires_human: boolean;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = { new: '#F59E0B', in_progress: '#00B4D8', resolved: '#10B981' };
const STATUS_LABELS: Record<string, string> = { new: 'Nouveau', in_progress: 'En cours', resolved: 'Résolu' };

export function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    api.get<any>('/admin/contact-messages')
      .then(d => { setMessages(d.data ?? []); setNewCount(d.new_count ?? 0); })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleResolve(id: number) {
    await api.patch(`/admin/contact-messages/${id}/resolve`);
    setMessages(m => m.map(x => x.id === id ? { ...x, status: 'resolved' } : x));
    setNewCount(n => Math.max(0, n - 1));
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce message ?')) return;
    await api.delete(`/admin/contact-messages/${id}`);
    setMessages(m => m.filter(x => x.id !== id));
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-ink">Messages support</h1>
          {newCount > 0 && (
            <span className="px-2.5 py-1 bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 rounded-full text-xs font-bold">
              {newCount} nouveau{newCount > 1 ? 'x' : ''}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">{messages.length} message{messages.length !== 1 ? 's' : ''} au total</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground"><div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />Chargement...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 cyna-card text-muted-foreground">Aucun message</div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => {
            const color = STATUS_COLORS[msg.status] ?? '#9AA3AF';
            const isOpen = expanded === msg.id;
            return (
              <div key={msg.id} className={`cyna-card overflow-hidden ${msg.requires_human ? '!border-[#F59E0B]/40' : ''}`}>
                <div className="flex items-center gap-4 p-5">
                  <button onClick={() => setExpanded(isOpen ? null : msg.id)} className="text-muted-foreground hover:text-ink">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  <div className="flex-shrink-0">
                    {msg.type === 'chatbot'
                      ? <Bot className="w-5 h-5 text-[#7C5CFC]" />
                      : <MessageSquare className="w-5 h-5 text-[#00B4D8]" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-ink text-sm font-semibold">{msg.email}</span>
                      {msg.requires_human && (
                        <span className="px-2 py-0.5 bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 rounded-full text-xs">Intervention requise</span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs truncate">{msg.subject ?? '(sans sujet)'}</div>
                  </div>

                  <span className="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}>
                    {STATUS_LABELS[msg.status] ?? msg.status}
                  </span>

                  <span className="text-muted-foreground text-xs flex-shrink-0">
                    {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                  </span>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {msg.status !== 'resolved' && (
                      <button onClick={() => handleResolve(msg.id)} title="Marquer résolu"
                        className="p-1.5 hover:bg-[#10B981]/10 rounded-lg transition-colors text-muted-foreground hover:text-[#10B981]">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(msg.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border px-5 py-4 bg-bg-subtle">
                    <p className="text-ink-soft text-sm whitespace-pre-wrap leading-relaxed">{msg.message_body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
