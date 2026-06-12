import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'Quelle est la diffÃ©rence entre SOC et EDR ?',
  'Quels sont vos tarifs ?',
  'Avez-vous un essai gratuit ?',
  'ÃŠtes-vous conformes RGPD / NIS2 ?',
];

// Rendu markdown safe sans dangerouslySetInnerHTML
function MessageContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return (
          <span key={i}>
            {part.split('\n').map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !started) {
      setHistory([{
        role: 'assistant',
        content: "Bonjour ! Je suis l'assistant virtuel CYNA.\nComment puis-je vous aider aujourd'hui ?",
      }]);
      setStarted(true);
    }
  }, [open, started]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
      setHistory([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch {
      setHistory([...newHistory, {
        role: 'assistant',
        content: 'Service temporairement indisponible.\nContactez-nous : **contact@cyna-it.fr**',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Ouvrir le chat support"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0098B7] shadow-[0_10px_30px_rgba(0,180,216,0.4)] flex items-center justify-center hover:-translate-y-0.5 transition-transform"
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageSquare className="w-6 h-6 text-white" />
        }
      </button>

      {/* FenÃªtre de chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(10,22,40,0.25)] border border-border flex flex-col bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-bg-subtle flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Support CYNA</p>
              <p className="text-white/70 text-xs mt-0.5">Assistant virtuel Â· En ligne</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#00B4D8] text-white rounded-br-sm'
                    : 'bg-bg-subtle text-ink-soft border border-border rounded-bl-sm'
                }`}>
                  <MessageContent text={msg.content} />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-bg-subtle border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-[#00B4D8] animate-spin" />
                  <span className="text-muted-foreground text-xs">En train d'Ã©crire...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Questions suggÃ©rÃ©es */}
          {history.length === 1 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs bg-bg-subtle hover:bg-[#00B4D8]/10 border border-border hover:border-[#00B4D8]/40 text-ink-soft hover:text-ink rounded-full px-3 py-1 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Zone de saisie */}
          <div className="border-t border-border p-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Votre question..."
              disabled={loading}
              className="flex-1 bg-bg-subtle border border-border rounded-full px-4 py-2 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] disabled:opacity-50"
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              aria-label="Envoyer"
              className="w-9 h-9 rounded-full bg-[#00B4D8] flex items-center justify-center hover:bg-[#0090ad] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
