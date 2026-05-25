import { useState } from 'react';
import { Link } from 'react-router';
import { LayoutDashboard, CreditCard, ShoppingBag, Settings, User, Lock, Bell, Globe, CheckCircle } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: '/espace-client', active: false },
  { icon: ShoppingBag, label: 'Abonnements', href: '/espace-client', active: false },
  { icon: CreditCard, label: 'Commandes', href: '/espace-client/commandes', active: false },
  { icon: Settings, label: 'Paramètres', href: '/espace-client/parametres', active: true },
];

export function DashboardSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00B4D8] to-[#0096B8] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">Jean Dupont</h3>
                <p className="text-sm text-gray-400">jean.dupont@entreprise.fr</p>
              </div>

              {/* Menu */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        item.active
                          ? 'bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Paramètres</h1>
              <p className="text-gray-400">Gérez vos informations personnelles et vos préférences</p>
            </div>

            {/* Success Banner */}
            {saved && (
              <div className="flex items-center gap-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl px-5 py-4">
                <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                <span className="text-[#10B981] font-medium">Modifications enregistrées avec succès !</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              {/* Section Informations personnelles */}
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
                      <input
                        type="text"
                        defaultValue="Jean"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Nom</label>
                      <input
                        type="text"
                        defaultValue="Dupont"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Entreprise</label>
                    <input
                      type="text"
                      defaultValue="Dupont & Associés SAS"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="jean.dupont@entreprise.fr"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Section Sécurité */}
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
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Section Préférences */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#10B981]/20 border border-[#10B981]/30 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Préférences</h2>
                </div>

                <div className="space-y-5">
                  {/* Toggle Notifications email */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Notifications par email</div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        Recevoir les alertes, factures et rappels de renouvellement
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailNotifs((v) => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        emailNotifs ? 'bg-[#00B4D8]' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          emailNotifs ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle Langue */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-white font-medium">Langue de l'interface</div>
                        <div className="text-sm text-gray-400 mt-0.5">Choisissez votre langue préférée</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setLang('fr')}
                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                          lang === 'fr'
                            ? 'bg-[#00B4D8] text-[#0A1628]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        FR
                      </button>
                      <button
                        type="button"
                        onClick={() => setLang('en')}
                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                          lang === 'en'
                            ? 'bg-[#00B4D8] text-[#0A1628]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        EN
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors text-lg"
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
