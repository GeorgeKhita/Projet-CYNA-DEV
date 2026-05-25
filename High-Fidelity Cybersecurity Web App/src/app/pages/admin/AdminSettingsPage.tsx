import { useState } from 'react';
import { Save, Shield, Bell, Globe, Palette } from 'lucide-react';

export function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('CYNA — Cybersecurity SaaS Platform');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Paramètres</h1>
        <p className="text-gray-400">Configuration générale de la plateforme</p>
      </div>

      {/* General */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-[#00B4D8]" />
          <h2 className="text-xl font-semibold text-white">Général</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Nom du site</label>
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Email de contact</label>
            <input
              defaultValue="contact@cyna-it.fr"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-[#8B5CF6]" />
          <h2 className="text-xl font-semibold text-white">Sécurité</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Mode maintenance', sublabel: 'Désactive l\'accès public temporairement', value: maintenanceMode, setter: setMaintenanceMode },
            { label: 'Authentification 2FA admin', sublabel: 'Obligatoire pour tous les admins', value: true, setter: () => {} },
            { label: 'HTTPS forcé', sublabel: 'Redirection automatique vers HTTPS', value: true, setter: () => {} },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/5">
              <div>
                <div className="text-white font-medium text-sm">{setting.label}</div>
                <div className="text-gray-500 text-xs mt-0.5">{setting.sublabel}</div>
              </div>
              <button
                onClick={() => setting.setter(!setting.value)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  setting.value ? 'bg-[#10B981]' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    setting.value ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-[#F59E0B]" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Notifications email', sublabel: 'Alertes par email à chaque nouvelle commande', value: emailNotifs, setter: setEmailNotifs },
            { label: 'Alertes sécurité', sublabel: 'Email immédiat si tentative d\'intrusion détectée', value: true, setter: () => {} },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/5">
              <div>
                <div className="text-white font-medium text-sm">{setting.label}</div>
                <div className="text-gray-500 text-xs mt-0.5">{setting.sublabel}</div>
              </div>
              <button
                onClick={() => setting.setter(!setting.value)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  setting.value ? 'bg-[#10B981]' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    setting.value ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RGPD Info */}
      <div className="bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Palette className="w-5 h-5 text-[#00B4D8]" />
          <h2 className="text-lg font-semibold text-white">Conformité RGPD</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Conformité', value: '100%', color: '#10B981' },
            { label: 'Données minimisées', value: '✓', color: '#10B981' },
            { label: 'Backups chiffrés', value: '✓', color: '#10B981' },
            { label: 'Logs conservés', value: '30j', color: '#00B4D8' },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 rounded-lg p-3">
              <div className="text-lg font-bold" style={{ color: item.color }}>{item.value}</div>
              <div className="text-gray-400 text-xs">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
        >
          <Save className="w-5 h-5" />
          Enregistrer les modifications
        </button>
        {savedMsg && (
          <span className="text-[#10B981] font-medium flex items-center gap-2">
            ✓ Paramètres sauvegardés
          </span>
        )}
      </div>
    </div>
  );
}
