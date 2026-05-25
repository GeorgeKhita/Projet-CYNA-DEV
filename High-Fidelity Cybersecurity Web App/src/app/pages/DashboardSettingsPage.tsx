import { useState, useEffect } from 'react';
import { User, Lock, Bell, Globe, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { useAuthStore } from '../store/authStore';
import { updateProfile } from '../api/auth';

export function DashboardSettingsPage() {
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [company, setCompany]       = useState('');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setCompany(user.company ?? '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPwd && newPwd !== confirmPwd) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        first_name: firstName,
        last_name: lastName,
        email,
        company,
      };
      if (currentPwd && newPwd) {
        payload.current_password     = currentPwd;
        payload.password             = newPwd;
        payload.password_confirmation = confirmPwd;
      }

      const updated = await updateProfile(payload);
      setUser({
        id: updated.id,
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
        company: updated.company ?? undefined,
        phone: updated.phone ?? undefined,
        role: updated.role,
      });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setSuccess('Modifications enregistrées avec succès !');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <DashboardSidebar active="settings" />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Paramètres</h1>
              <p className="text-gray-400">Gérez vos informations personnelles et vos préférences</p>
            </div>

            {success && (
              <div className="flex items-center gap-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl px-5 py-4">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                <span className="text-[#10B981] font-medium">{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              {/* Informations personnelles */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#00B4D8]/20 border border-[#00B4D8]/30 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Informations personnelles</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Prénom</label>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Nom</label>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Entreprise</label>
                    <input value={company} onChange={(e) => setCompany(e.target.value)}
                      type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)}
                      type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
              </div>

              {/* Sécurité */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Sécurité</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Mot de passe actuel</label>
                    <input value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)}
                      type="password" placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Nouveau mot de passe</label>
                    <input value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                      type="password" placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Confirmer le nouveau mot de passe</label>
                    <input value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                      type="password" placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
              </div>

              {/* Préférences */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#10B981]/20 border border-[#10B981]/30 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Préférences</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Notifications par email</div>
                    <div className="text-sm text-gray-400 mt-0.5">Alertes, factures et rappels de renouvellement</div>
                  </div>
                  <button type="button" onClick={() => setEmailNotifs((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifs ? 'bg-[#00B4D8]' : 'bg-white/10'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors text-lg disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
