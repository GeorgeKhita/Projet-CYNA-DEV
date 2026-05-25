import { useState } from 'react';
import { Mail, Send, CheckCircle, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { sendContact } from '../api/contact';
import { useAuthStore } from '../store/authStore';

export function ContactPage() {
  const user = useAuthStore((s) => s.user);

  const [email, setEmail]     = useState(user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName]       = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

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

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-400">Notre équipe est là pour vous aider</p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Mail, label: 'Email', value: 'contact@cyna-it.fr', color: '#00B4D8' },
            { icon: MessageSquare, label: 'Chat en direct', value: 'Bouton en bas à droite', color: '#8B5CF6' },
            { icon: CheckCircle, label: 'Délai de réponse', value: '2h en heures ouvrées', color: '#10B981' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-5 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
                  <div className="text-white text-sm font-medium">{item.value}</div>
                </div>
              </div>
            );
          })}
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

        {/* Chat hint */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#00B4D8]" />
            Vous pouvez aussi utiliser le <span className="text-[#00B4D8]">chat en direct</span> via le bouton en bas à droite de l'écran
          </p>
        </div>
      </div>
    </div>
  );
}
