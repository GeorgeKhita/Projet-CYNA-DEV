import { useState, FormEvent, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Mail, Lock, Info, Building, Search, MapPin, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface CompanySuggestion {
  siren: string;
  label: string;
  city: string;
  postal_code: string;
  siret: string | null;
}

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    company: '',
    siren: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [companyQuery, setCompanyQuery]     = useState('');
  const [suggestions, setSuggestions]       = useState<CompanySuggestion[]>([]);
  const [showDropdown, setShowDropdown]     = useState(false);
  const [searchLoading, setSearchLoading]   = useState(false);
  const [companyConfirmed, setCompanyConfirmed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (companyQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await api.get<CompanySuggestion[]>(
          `/companies/search?q=${encodeURIComponent(companyQuery)}`
        );
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [companyQuery]);

  function handleCompanyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCompanyQuery(val);
    setCompanyConfirmed(false);
    setForm(f => ({ ...f, company: val, siren: '' }));
  }

  function selectSuggestion(s: CompanySuggestion) {
    setForm(f => ({ ...f, company: s.label, siren: s.siren }));
    setCompanyQuery(s.label);
    setCompanyConfirmed(true);
    setShowDropdown(false);
    setSuggestions([]);
  }

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError(t('register.error_passwords'));
      return;
    }
    setLoading(true);
    try {
      await api.post<any>('/auth/register', form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('register.error_default'));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-subtle to-background flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md fade-up">
          <div className="cyna-card p-8 shadow-[var(--shadow-lg)] text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0098B7] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(0,180,216,0.35)]">⬡</div>
              <span className="text-2xl font-bold text-ink">CYNA</span>
            </div>
            <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-ink mb-3">Vérifiez votre email</h1>
            <p className="text-muted-foreground mb-6">
              Un email de confirmation a été envoyé à <strong className="text-ink">{form.email}</strong>.<br />
              Cliquez sur le lien dans l'email pour activer votre compte.
            </p>
            <Link to="/connexion" className="btn btn-primary btn-block">
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-subtle to-background flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md fade-up">
        <div className="cyna-card p-8 shadow-[var(--shadow-lg)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0098B7] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(0,180,216,0.35)]">⬡</div>
              <span className="text-2xl font-bold text-ink">CYNA</span>
            </div>
            <h1 className="text-3xl font-bold text-ink mb-2">{t('register.title')}</h1>
            <p className="text-muted-foreground">{t('register.subtitle')}</p>
          </div>

          {error && (
            <div role="alert" className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="register-first-name" className="block text-ink mb-2">{t('register.first_name')}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input id="register-first-name" type="text" value={form.first_name} onChange={set('first_name')} placeholder="Jean" required className="field field-icon" />
                </div>
              </div>
              <div>
                <label htmlFor="register-last-name" className="block text-ink mb-2">{t('register.last_name')}</label>
                <input id="register-last-name" type="text" value={form.last_name} onChange={set('last_name')} placeholder="Dupont" required className="field" />
              </div>
            </div>

            {/* Autocomplete Entreprise */}
            <div>
              <label htmlFor="register-company" className="block text-ink mb-2">
                {t('register.company')}
                <span className="ml-2 text-xs text-muted-foreground font-normal">{t('register.company_hint')}</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  {companyConfirmed
                    ? <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                    : <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  }
                  <input
                    id="register-company"
                    type="text"
                    value={companyQuery}
                    onChange={handleCompanyInput}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    placeholder={t('register.company_placeholder')}
                    autoComplete="off"
                    required
                    className="field field-icon pr-10"
                  />
                  {searchLoading && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!searchLoading && companyQuery.length >= 2 && (
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {showDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0f2040] border border-border rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                    {suggestions.map((s) => (
                      <button
                        key={s.siren}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-4 py-3 hover:bg-[#1e3a5f] transition-colors border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{s.label}</p>
                            {(s.city || s.postal_code) && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                {[s.postal_code, s.city].filter(Boolean).join(' ')}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-[#00B4D8] font-mono whitespace-nowrap mt-0.5">
                            {s.siren}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {companyConfirmed && form.siren && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('register.company_verified')} <span className="font-mono font-semibold">{form.siren}</span></span>
                </div>
              )}

              {companyQuery.length >= 2 && !searchLoading && suggestions.length === 0 && !companyConfirmed && (
                <p className="mt-1.5 text-xs text-muted-foreground">{t('register.company_not_found')}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-ink mb-2">{t('register.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input id="register-email" type="email" value={form.email} onChange={set('email')} placeholder="votre.email@entreprise.com" required className="field field-icon" />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="block text-ink mb-2">{t('register.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input id="register-password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required className="field field-icon" />
              </div>
            </div>

            <div>
              <label htmlFor="register-password-confirm" className="block text-ink mb-2">{t('register.confirm_password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input id="register-password-confirm" type="password" value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="••••••••" required className="field field-icon" />
              </div>
            </div>

            <div className="bg-bg-subtle border border-border rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#00B4D8] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">{t('register.password_hint')}</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
              {loading ? t('register.submitting') : t('register.submit')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('register.already_account')} </span>
            <Link to="/connexion" className="text-primary hover:underline font-semibold">{t('register.login_link')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
