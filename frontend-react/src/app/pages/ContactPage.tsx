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
    <div className="min-h-screen bg-gradient-to-b from-bg-subtle to-background py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 fade-up">
          <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-4">Contactez-nous</h1>
          <p className="text-xl text-muted-foreground">Notre équipe est là pour vous aider</p>
        </div>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#10B981]/15 border-2 border-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">Message envoyé !</h2>
              <p className="text-muted-foreground mb-6">Nous vous répondrons dans les 2 heures ouvrées.</p>
              <button onClick={() => setSuccess(false)} className="btn btn-primary">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
              )}
              <div>
                <label className="block text-ink mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" value={form.email} onChange={set('email')} required
                    placeholder="votre.email@entreprise.com" className="field field-icon" />
                </div>
              </div>
              <div>
                <label className="block text-ink mb-2">Sujet</label>
                <input type="text" value={form.subject} onChange={set('subject')} required
                  placeholder="Quel est l'objet de votre message ?" className="field" />
              </div>
              <div>
                <label className="block text-ink mb-2">Message</label>
                <textarea rows={6} value={form.message} onChange={set('message')} required
                  placeholder="Décrivez votre demande en détail..." className="field resize-none" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
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
