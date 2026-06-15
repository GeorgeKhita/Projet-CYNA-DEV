import { useState, FormEvent } from 'react';
import { Mail, Send, Phone, Clock, MapPin } from 'lucide-react';
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
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 fade-up">
          <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-4">Contactez-nous</h1>
          <p className="text-xl text-muted-foreground">Notre équipe est là pour vous aider</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations de contact */}
          <div className="space-y-4">
            <div className="cyna-card p-6">
              <h2 className="text-lg font-bold text-ink mb-5">Nos coordonnées</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/12 border border-[#00B4D8]/25 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Email</p>
                    <a href="mailto:contact@cyna-it.fr" className="text-ink font-semibold hover:text-primary transition-colors">
                      contact@cyna-it.fr
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">Réponse sous 2h ouvrées</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/12 border border-[#00B4D8]/25 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Téléphone</p>
                    <a href="tel:+33123456789" className="text-ink font-semibold hover:text-primary transition-colors">
                      +33 1 23 45 67 89
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">Lun–Ven, 9h–18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/12 border border-[#00B4D8]/25 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Horaires</p>
                    <p className="text-ink font-semibold">Lundi – Vendredi</p>
                    <p className="text-xs text-muted-foreground mt-0.5">9h00 – 18h00 (CET)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/12 border border-[#00B4D8]/25 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Adresse</p>
                    <p className="text-ink font-semibold">Paris, France</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Siège social</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cyna-card p-5 bg-[#00B4D8]/6 border-[#00B4D8]/25">
              <p className="text-sm font-semibold text-ink mb-1">Support d'urgence 24/7</p>
              <p className="text-xs text-muted-foreground mb-3">Pour nos clients SOC Premium, une ligne dédiée est disponible en cas d'incident critique.</p>
              <a href="tel:+33800000000" className="text-[#00B4D8] text-sm font-bold hover:underline">+33 800 000 000 (gratuit)</a>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2 cyna-card p-8 shadow-[var(--shadow-md)]">
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
                <h2 className="text-xl font-bold text-ink">Envoyer un message</h2>
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
    </div>
  );
}
