import { Link } from 'react-router';
import { Mail, Lock } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-[#00B4D8] text-3xl">⬡</div>
              <span className="text-2xl font-semibold text-[#00B4D8]">CYNA</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
            <p className="text-gray-400">Accédez à votre espace client</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="votre.email@entreprise.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#00B4D8] focus:ring-[#00B4D8]"
                />
                Se souvenir de moi
              </label>
              <Link to="/mot-de-passe-oublie" className="text-[#00B4D8] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
            >
              Se connecter
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0F1F3A] text-gray-400">ou</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/inscription"
            className="block w-full py-3 bg-transparent border-2 border-[#00B4D8] text-[#00B4D8] font-semibold rounded-lg text-center hover:bg-[#00B4D8]/10 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
