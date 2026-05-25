import { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cyna_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cyna_cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cyna_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-[#0F1F3A] border border-white/10 rounded-xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-[#00B4D8]/20 border border-[#00B4D8]/30 rounded-lg flex items-center justify-center">
            <Cookie className="w-5 h-5 text-[#00B4D8]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#10B981] flex-shrink-0" />
            <span className="text-white font-semibold text-sm">Respect de votre vie privée — RGPD</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Nous utilisons des cookies essentiels au fonctionnement de la plateforme. Aucune donnée n'est transmise à des tiers à des fins publicitaires.{' '}
            <a href="#" className="text-[#00B4D8] hover:underline">Politique de confidentialité</a>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-sm hover:bg-[#0096B8] transition-colors"
          >
            Accepter
          </button>
          <button
            onClick={decline}
            className="p-1 text-gray-500 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
