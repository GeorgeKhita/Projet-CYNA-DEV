import { useState } from 'react';
import { Mail, MessageSquare, Send, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { sendContact } from '../api/contact';
import { useAuthStore } from '../store/authStore';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  time: string;
}

const BOT_RESPONSES = [
  'Merci pour votre message ! Un de nos experts va vous répondre rapidement.',
  'Bonne question ! Souhaitez-vous être rappelé par notre équipe commerciale ?',
  'Je transmets votre demande à notre équipe support. Délai de réponse : 2h en heures ouvrées.',
  "Nos solutions sont disponibles en démonstration gratuite. Voulez-vous planifier un appel ?",
];

export function ContactPage() {
  const user = useAuthStore((s) => s.user);

  // Form state
  const [email, setEmail]     = useState(user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName]       = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  // Chat state
  const [chatOpen, setChatOpen]   = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", time: 'À l\'instant' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendContact({ email, subject, message, name: name || undefined });
      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter directement.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput, time: now() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setTimeout(() => {
      const botText = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      setChatMessages((prev) => [...prev, { role: 'bot', text: botText, time: now() }]);
      setChatLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-400">Notre équipe est là pour vous aider</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10B981]/20 border-2 border-[#10B981] rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-[#10B981]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Message envoyé !</h2>
              <p className="text-gray-400 mb-6">Notre équipe vous répondra dans les meilleurs délais (2h en heures ouvrées).</p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="votre.email@entreprise.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Sujet *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Quel est l'objet de votre message ?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Message *</label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Décrivez votre demande en détail..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#00B4D8] rounded-full flex items-center justify-center shadow-lg shadow-[#00B4D8]/30 hover:bg-[#0096B8] transition-all hover:scale-110"
        >
          <MessageSquare className="w-7 h-7 text-[#0A1628]" />
        </button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#00B4D8] to-[#0096B8] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">Support CYNA</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                  <div className="text-xs text-white/80">En ligne</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 space-y-4 h-80 overflow-y-auto bg-[#0A1628]">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'bot' ? 'bg-[#00B4D8]/20' : 'bg-[#00B4D8]'
                }`}>
                  {msg.role === 'bot'
                    ? <MessageSquare className="w-4 h-4 text-[#00B4D8]" />
                    : <span className="text-white text-xs font-semibold">
                        {user ? user.firstName[0] + user.lastName[0] : 'U'}
                      </span>
                  }
                </div>
                <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block rounded-lg p-3 text-sm ${
                    msg.role === 'bot'
                      ? 'bg-white/5 border border-white/10 rounded-tl-none text-gray-300'
                      : 'bg-[#00B4D8] rounded-tr-none text-[#0A1628] font-medium'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{msg.time}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#00B4D8]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#00B4D8]" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg rounded-tl-none p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/10 bg-[#0A1628]">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Tapez votre message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent text-sm"
              />
              <button
                onClick={handleChatSend}
                className="w-10 h-10 bg-[#00B4D8] rounded-lg flex items-center justify-center hover:bg-[#0096B8] transition-colors"
              >
                <Send className="w-4 h-4 text-[#0A1628]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
