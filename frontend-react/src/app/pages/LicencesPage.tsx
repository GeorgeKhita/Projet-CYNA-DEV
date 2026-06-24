import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Key, Copy, Check } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';

interface License {
  id: number;
  license_key: string;
  product: string | null;
  order_id: number;
  activated_at: string | null;
  created_at: string;
}

export function LicencesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [licenses, setLicenses]   = useState<License[]>([]);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<License[]>('/licenses')
      .then(data => setLicenses(Array.isArray(data) ? data : []))
      .catch(() => setLicenses([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function handleCopy(id: number, key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (authLoading) return <div className="min-h-screen bg-card flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-ink mb-1">Mes licences</h1>
              <p className="text-muted-foreground">{licenses.length} clé{licenses.length !== 1 ? 's' : ''} de licence</p>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground py-8">
                <div className="w-5 h-5 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /> Chargement...
              </div>
            ) : licenses.length === 0 ? (
              <div className="text-center py-16 cyna-card">
                <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune licence pour le moment.</p>
                <p className="text-sm text-muted-foreground mt-2">Les clés de licence apparaissent ici après validation de votre commande.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {licenses.map(lic => (
                  <div key={lic.id} className="cyna-card p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-4 h-4 text-[#00B4D8]" />
                          <span className="font-bold text-ink">{lic.product ?? `Produit #${lic.order_id}`}</span>
                          <span className="text-xs text-muted-foreground">— Commande #{lic.order_id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <code className="font-mono text-base font-bold tracking-widest text-[#00B4D8] bg-[#00B4D8]/8 border border-[#00B4D8]/20 px-3 py-1.5 rounded-lg select-all">
                            {lic.license_key}
                          </code>
                          <button
                            onClick={() => handleCopy(lic.id, lic.license_key)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-bg-subtle hover:bg-bg-muted transition-colors"
                            title="Copier la clé">
                            {copied === lic.id
                              ? <Check className="w-4 h-4 text-[#10B981]" />
                              : <Copy className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground space-y-0.5">
                        <div>Générée le {new Date(lic.created_at).toLocaleDateString('fr-FR')}</div>
                        {lic.activated_at && (
                          <div>Activée le {new Date(lic.activated_at).toLocaleDateString('fr-FR')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
