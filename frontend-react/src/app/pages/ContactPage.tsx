import { useState, FormEvent } from 'react';
import { Mail, Send } from 'lucide-react';
import { api } from '../../api/client';

export function ContactPage() {
  const [form, setForm] = useState({ email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSuccess(true);
      setForm({ email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-400">Notre équipe est là pour vous aider</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#10B981]/20 border-2 border-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Message envoyé !</h2>
              <p className="text-gray-400 mb-6">Nous vous répondrons dans les 2 heures ouvrées.</p>
              <button onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-white font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={form.email} onChange={set('email')} required
                    placeholder="votre.email@entreprise.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Sujet</label>
                <input type="text" value={form.subject} onChange={set('subject')} required
                  placeholder="Quel est l'objet de votre message ?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Message</label>
                <textarea rows={6} value={form.message} onChange={set('message')} required
                  placeholder="Décrivez votre demande en détail..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                <Send className="w-5 h-5" />
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
