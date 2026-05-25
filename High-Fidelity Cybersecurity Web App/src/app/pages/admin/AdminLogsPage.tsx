import { Shield, LogIn, Package, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface LogEntry {
  id: number;
  time: string;
  date: string;
  action: string;
  user: string;
  detail: string;
  type: 'auth' | 'product' | 'order' | 'user' | 'system' | 'error';
}

const LOGS: LogEntry[] = [
  { id: 1, time: '14:32:18', date: '25/05/2026', action: 'Produit modifié', user: 'admin@cyna-it.fr', detail: 'Cyna SOC Premium — prix mensuel : 1199€ → 1299€', type: 'product' },
  { id: 2, time: '13:15:44', date: '25/05/2026', action: 'Nouvelle commande', user: 'système', detail: 'CYN-2026-0051 créée — TechCorp SA — 1 299€/mois', type: 'order' },
  { id: 3, time: '11:48:22', date: '25/05/2026', action: 'Connexion admin', user: 'admin@cyna-it.fr', detail: 'Connexion réussie depuis IP: 82.65.4.12 — 2FA validé', type: 'auth' },
  { id: 4, time: '10:22:05', date: '25/05/2026', action: 'Utilisateur créé', user: 'admin@cyna-it.fr', detail: 'Nouveau compte : jean.dupont@techcorp.fr — TechCorp SA', type: 'user' },
  { id: 5, time: '09:05:33', date: '25/05/2026', action: 'Tentative échouée', user: 'unknown', detail: '3 tentatives de connexion admin depuis IP: 45.123.56.78', type: 'error' },
  { id: 6, time: '22:45:11', date: '24/05/2026', action: 'Sauvegarde BDD', user: 'système', detail: 'Backup MySQL chiffré AES-256 — taille: 45.2 MB — S3', type: 'system' },
  { id: 7, time: '18:30:00', date: '24/05/2026', action: 'Commande annulée', user: 'admin@cyna-it.fr', detail: 'CYN-2026-0046 annulée — CyberGuard — Demande client', type: 'order' },
  { id: 8, time: '15:12:40', date: '24/05/2026', action: 'Catégorie modifiée', user: 'admin@cyna-it.fr', detail: 'EDR — Description mise à jour', type: 'product' },
  { id: 9, time: '08:00:00', date: '24/05/2026', action: 'Démarrage système', user: 'système', detail: 'API CYNA v1.0 démarrée — uptime 0ms — toutes dépendances OK', type: 'system' },
];

const typeConfig = {
  auth: { icon: LogIn, color: '#00B4D8', label: 'Auth' },
  product: { icon: Package, color: '#8B5CF6', label: 'Produit' },
  order: { icon: CheckCircle, color: '#10B981', label: 'Commande' },
  user: { icon: Users, color: '#F59E0B', label: 'Utilisateur' },
  system: { icon: Shield, color: '#6B7280', label: 'Système' },
  error: { icon: XCircle, color: '#EF4444', label: 'Erreur' },
};

export function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-[#F59E0B]" />
            Logs d'activité
          </h1>
          <p className="text-gray-400">Journal complet des actions critiques — conservation 30 jours</p>
        </div>
      </div>

      {/* Type Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([key, { color, label }]) => (
          <span
            key={key}
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Logs */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {LOGS.map((log) => {
            const { icon: Icon, color, label } = typeConfig[log.type];
            return (
              <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors">
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-white font-semibold text-sm">{log.action}</span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                    >
                      {label}
                    </span>
                    {log.type === 'error' && (
                      <span className="px-2 py-0.5 bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 rounded text-xs font-semibold animate-pulse">
                        ⚠ Alerte
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{log.detail}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-gray-600 text-xs">
                    <span>👤 {log.user}</span>
                    <span>📅 {log.date}</span>
                    <span>🕐 {log.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-gray-600 text-sm">
          Affichage des 9 derniers événements — conformité RGPD & ISO 27001 ✓
        </p>
      </div>
    </div>
  );
}
