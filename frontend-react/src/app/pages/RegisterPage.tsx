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
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-[#00B4D8] text-3xl">⬡</div>
              <span className="text-2xl font-semibold text-[#00B4D8]">CYNA</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-gray-400">Rejoignez la communauté CYNA</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={form.first_name} onChange={set('first_name')} placeholder="Jean" required
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Nom</label>
                <input type="text" value={form.last_name} onChange={set('last_name')} placeholder="Dupont" required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Entreprise</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={form.company} onChange={set('company')} placeholder="Nom de votre entreprise"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="votre.email@entreprise.com" required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="••••••••" required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#00B4D8] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Minimum 8 caractères, avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-60">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Déjà un compte ? </span>
            <Link to="/connexion" className="text-[#00B4D8] hover:underline font-medium">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
