import { useState, useEffect } from 'react';
import { Save, Shield, Bell, Globe, Palette, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { adminGetSettings, adminUpdateSettings } from '../../api/admin';

export function AdminSettingsPage() {
  const [siteName, setSiteName]             = useState('CYNA — Cybersecurity SaaS Platform');
  const [contactEmail, setContactEmail]     = useState('contact@cyna-it.fr');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifs, setEmailNotifs]       = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    adminGetSettings()
      .then((settings) => {
        if (settings.site_name)       setSiteName(String(settings.site_name));
        if (settings.contact_email)   setContactEmail(String(settings.contact_email));
        if ('maintenance_mode' in settings) setMaintenanceMode(Boolean(settings.maintenance_mode));
        if ('email_notifications' in settings) setEmailNotifs(Boolean(settings.email_notifications));
        if ('security_alerts' in settings) setSecurityAlerts(Boolean(settings.security_alerts));
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await adminUpdateSettings({
        site_name: siteName,
        contact_email: contactEmail,
        maintenance_mode: maintenanceMode,
        email_notifications: emailNotifs,
        security_alerts: securityAlerts,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Erreur lors de la sauvegarde des paramètres.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-400 py-12">
        <Loader2 className="w-5 h-5 animate-spin" />Chargement...
      </div>
    );
  }

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
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
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
            {
              label: 'Mode maintenance',
              sublabel: "Désactive l'accès public temporairement",
              value: maintenanceMode,
              setter: setMaintenanceMode,
            },
            {
              label: 'Authentification 2FA admin',
              sublabel: 'Obligatoire pour tous les admins',
              value: true,
              setter: () => {},
            },
            {
              label: 'HTTPS forcé',
              sublabel: 'Redirection automatique vers HTTPS',
              value: true,
              setter: () => {},
            },
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
            {
              label: 'Notifications email',
              sublabel: 'Alertes par email à chaque nouvelle commande',
              value: emailNotifs,
              setter: setEmailNotifs,
            },
            {
              label: 'Alertes sécurité',
              sublabel: "Email immédiat si tentative d'intrusion détectée",
              value: securityAlerts,
              setter: setSecurityAlerts,
            },
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
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
        {success && (
          <span className="text-[#10B981] font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Paramètres sauvegardés
          </span>
        )}
        {error && (
          <span className="text-red-400 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
