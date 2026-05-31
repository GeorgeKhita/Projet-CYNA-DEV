import { Link } from 'react-router';
import { Shield, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00B4D8]/10 border border-[#00B4D8]/20 rounded-2xl mb-8">
          <Shield className="w-10 h-10 text-[#00B4D8]" />
        </div>

        <div className="text-8xl font-black text-white/5 mb-4 leading-none select-none">404</div>

        <h1 className="text-3xl font-bold text-white mb-3">Page introuvable</h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
          >
            Voir nos solutions
          </Link>
        </div>
      </div>
    </div>
  );
}
