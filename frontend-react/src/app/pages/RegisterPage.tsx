import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Mail, Lock, Info, Building } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', company: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post<{ token: string; user: any }>('/auth/register', form);
      login(data.token, data.user);
      navigate('/espace-client');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8FB] to-white flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md fade-up">
        <div className="cyna-card p-8 shadow-[var(--shadow-lg)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0098B7] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(0,180,216,0.35)]">⬡</div>
              <span className="text-2xl font-bold text-[#0A1628]">CYNA</span>
            </div>
            <h1 className="text-3xl font-bold text-[#0A1628] mb-2">Créer un compte</h1>
            <p className="text-[#69727F]">Rejoignez la communauté CYNA</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#0A1628] mb-2">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                  <input type="text" value={form.first_name} onChange={set('first_name')} placeholder="Jean" required className="field field-icon" />
                </div>
              </div>
              <div>
                <label className="block text-[#0A1628] mb-2">Nom</label>
                <input type="text" value={form.last_name} onChange={set('last_name')} placeholder="Dupont" required className="field" />
              </div>
            </div>

            <div>
              <label className="block text-[#0A1628] mb-2">Entreprise</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                <input type="text" value={form.company} onChange={set('company')} placeholder="Nom de votre entreprise" className="field field-icon" />
              </div>
            </div>

            <div>
              <label className="block text-[#0A1628] mb-2">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="votre.email@entreprise.com" required className="field field-icon" />
              </div>
            </div>

            <div>
              <label className="block text-[#0A1628] mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required className="field field-icon" />
              </div>
            </div>

            <div>
              <label className="block text-[#0A1628] mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                <input type="password" value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="••••••••" required className="field field-icon" />
              </div>
            </div>

            <div className="bg-[#F6F8FB] border border-[#E5E9F0] rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#00B4D8] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#69727F] leading-relaxed">
                  Minimum 8 caractères, avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#69727F]">Déjà un compte ? </span>
            <Link to="/connexion" className="text-[#0098B7] hover:underline font-semibold">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
