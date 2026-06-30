import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, Mail, Lock, User, Building, UserX, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type TabId = 'login' | 'register' | 'guest';

const NEXT_STEP = '/checkout/paiement';

export function CheckoutIdentificationPage() {
  const { isAuthenticated, login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('login');

  useEffect(() => {
    if (isAuthenticated) navigate(NEXT_STEP, { replace: true });
  }, [isAuthenticated]);

  const steps = [
    { id: 1, name: t('checkout.step_identification'), active: true,  completed: false },
    { id: 2, name: t('checkout.step_payment'),        active: false, completed: false },
    { id: 3, name: t('checkout.step_confirmation'),   active: false, completed: false },
  ];

  const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
    { id: 'login',    label: t('checkout.tab_login'),    Icon: Lock },
    { id: 'register', label: t('checkout.tab_register'), Icon: User },
    { id: 'guest',    label: t('checkout.tab_guest'),    Icon: UserX },
  ];

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed ? 'bg-[#10B981] text-white' : step.active ? 'bg-[#00B4D8] text-[#06222C] shadow-[var(--shadow-cyan)]' : 'bg-bg-subtle border border-border text-muted-foreground'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-semibold hidden sm:block ${step.active || step.completed ? 'text-ink' : 'text-muted-foreground'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-[#E5E9F0]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="cyna-card shadow-[var(--shadow-md)] overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-0">
            <h1 className="text-3xl font-bold text-ink mb-1">{t('checkout.identification_title')}</h1>
            <p className="text-muted-foreground mb-6">{t('checkout.identification_subtitle')}</p>

            {/* Tab selector */}
            <div className="flex gap-1 p-1 bg-bg-subtle rounded-xl border border-border">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                    tab === id
                      ? 'bg-card text-ink shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-ink'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-8">
            {tab === 'login'    && <LoginForm    navigate={navigate} login={login} t={t} />}
            {tab === 'register' && <RegisterForm navigate={navigate} login={login} t={t} switchToLogin={() => setTab('login')} />}
            {tab === 'guest'    && <GuestForm    navigate={navigate} t={t} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Onglet 1 : Connexion ─────────────────────────────────────────────────────

interface LoginFormProps {
  navigate: ReturnType<typeof useNavigate>;
  login: (token: string, user: any) => void;
  t: (key: string) => string;
}

function LoginForm({ navigate, login, t }: LoginFormProps) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<{ token: string; user: any }>('/auth/login', { email, password });
      login(data.token, data.user);
      navigate(NEXT_STEP);
    } catch (err: any) {
      setError(err.message || t('checkout.error_default'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
      )}
      <div>
        <label className="block text-ink mb-2">{t('checkout.email')}</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="votre.email@entreprise.com" className="field field-icon" />
        </div>
      </div>
      <div>
        <label className="block text-ink mb-2">{t('checkout.password')}</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="••••••••" className="field field-icon" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
        {loading ? t('checkout.login_loading') : t('checkout.login_submit')}
      </button>
      <div className="flex items-center justify-between text-sm pt-1">
        <Link to="/mot-de-passe-oublie" className="text-muted-foreground hover:text-primary transition-colors">
          {t('checkout.forgot_password')}
        </Link>
      </div>
    </form>
  );
}

// ── Onglet 2 : Inscription ───────────────────────────────────────────────────

interface RegisterFormProps {
  navigate: ReturnType<typeof useNavigate>;
  login: (token: string, user: any) => void;
  t: (key: string, opts?: any) => string;
  switchToLogin: () => void;
}

function RegisterForm({ t, switchToLogin }: RegisterFormProps) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', company: '',
    email: '', password: '', password_confirmation: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError(t('checkout.register_error_passwords'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('checkout.error_default'));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4 space-y-4">
        <CheckCircle2 className="w-14 h-14 text-[#10B981] mx-auto" />
        <h2 className="text-xl font-bold text-ink">{t('checkout.register_success_title')}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          {t('checkout.register_success_desc', { email: form.email })}
        </p>
        <button onClick={switchToLogin} className="btn btn-primary btn-lg">
          {t('checkout.register_back_to_login')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-ink mb-2 text-sm">{t('checkout.register_first_name')}</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={form.first_name} onChange={set('first_name')} required
              placeholder="Prénom" className="field field-icon" />
          </div>
        </div>
        <div>
          <label className="block text-ink mb-2 text-sm">{t('checkout.register_last_name')}</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={form.last_name} onChange={set('last_name')} required
              placeholder="Nom" className="field field-icon" />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-ink mb-2 text-sm">{t('checkout.register_company')}</label>
        <div className="relative">
          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={form.company} onChange={set('company')} required
            placeholder="Votre entreprise" className="field field-icon" />
        </div>
      </div>
      <div>
        <label className="block text-ink mb-2 text-sm">{t('checkout.email')}</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="email" value={form.email} onChange={set('email')} required
            placeholder="votre.email@entreprise.com" className="field field-icon" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-ink mb-2 text-sm">{t('checkout.password')}</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" value={form.password} onChange={set('password')} required
              placeholder="••••••••" className="field field-icon" />
          </div>
        </div>
        <div>
          <label className="block text-ink mb-2 text-sm">{t('checkout.register_password_confirm')}</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" value={form.password_confirmation} onChange={set('password_confirmation')} required
              placeholder="••••••••" className="field field-icon" />
          </div>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block mt-2">
        {loading ? t('checkout.register_loading') : t('checkout.register_submit')}
      </button>
    </form>
  );
}

// ── Onglet 3 : Invité ────────────────────────────────────────────────────────

interface GuestFormProps {
  navigate: ReturnType<typeof useNavigate>;
  t: (key: string) => string;
}

function GuestForm({ navigate, t }: GuestFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sessionStorage.setItem('cyna_guest', JSON.stringify({
      type: 'guest', first_name: firstName, last_name: lastName, email,
    }));
    navigate(NEXT_STEP);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start gap-3 px-4 py-3 bg-[#F59E0B]/8 border border-[#F59E0B]/30 rounded-xl">
        <UserX className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-ink-soft">{t('checkout.guest_notice')}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-ink mb-2 text-sm">{t('checkout.guest_first_name')}</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
              placeholder="Prénom" className="field field-icon" />
          </div>
        </div>
        <div>
          <label className="block text-ink mb-2 text-sm">{t('checkout.guest_last_name')}</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
              placeholder="Nom" className="field field-icon" />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-ink mb-2 text-sm">
          {t('checkout.email')}
          <span className="ml-2 text-xs text-muted-foreground font-normal">— {t('checkout.guest_email_hint')}</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="votre.email@exemple.com" className="field field-icon" />
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-lg btn-block">
        {t('checkout.guest_submit')}
      </button>
    </form>
  );
}
