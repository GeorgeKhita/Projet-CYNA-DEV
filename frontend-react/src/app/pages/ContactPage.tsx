import { useState, FormEvent } from 'react';
import { Mail, Send, Phone, Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';

export function ContactPage() {
  const { t } = useTranslation();
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
      setError(err.message || t('contact.error_default'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-subtle to-background py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 fade-up">
          <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-muted-foreground">{t('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations de contact */}
          <div className="space-y-4">
            <div className="cyna-card p-6">
              <h2 className="text-lg font-bold text-ink mb-5">{t('contact.coordinates_title')}</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/12 border border-[#00B4D8]/25 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{t('contact.email_label')}</p>
                    <a href="mailto:contact@cyna-it.fr" className="text-ink font-semibold hover:text-primary transition-colors">
                      contact@cyna-it.fr
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('contact.email_response')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/12 border border-[#00B4D8]/25 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{t('contact.phone_label')}</p>
                    <a href="tel:+33123456789" className="text-ink font-semibold hover:text-primary transition-colors">
                      +33 1 23 45 67 89
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('contact.phone_hours')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/12 border border-[#00B4D8]/25 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{t('contact.hours_label')}</p>
                    <p className="text-ink font-semibold">{t('contact.hours_value')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('contact.hours_detail')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/12 border border-[#00B4D8]/25 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{t('contact.address_label')}</p>
                    <p className="text-ink font-semibold">{t('contact.address_value')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('contact.address_detail')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cyna-card p-5 bg-[#00B4D8]/6 border-[#00B4D8]/25">
              <p className="text-sm font-semibold text-ink mb-1">{t('contact.emergency_title')}</p>
              <p className="text-xs text-muted-foreground mb-3">{t('contact.emergency_desc')}</p>
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
                <h2 className="text-2xl font-bold text-ink mb-2">{t('contact.success_title')}</h2>
                <p className="text-muted-foreground mb-6">{t('contact.success_desc')}</p>
                <button onClick={() => setSuccess(false)} className="btn btn-primary">
                  {t('contact.send_another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-ink">{t('contact.form_title')}</h2>
                {error && (
                  <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
                )}
                <div>
                  <label className="block text-ink mb-2">{t('contact.email_field')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="email" value={form.email} onChange={set('email')} required
                      placeholder="votre.email@entreprise.com" className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label className="block text-ink mb-2">{t('contact.subject_field')}</label>
                  <input type="text" value={form.subject} onChange={set('subject')} required
                    placeholder={t('contact.subject_placeholder')} className="field" />
                </div>
                <div>
                  <label className="block text-ink mb-2">{t('contact.message_field')}</label>
                  <textarea rows={6} value={form.message} onChange={set('message')} required
                    placeholder={t('contact.message_placeholder')} className="field resize-none" />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
                  <Send className="w-5 h-5" />
                  {loading ? t('contact.submitting') : t('contact.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
