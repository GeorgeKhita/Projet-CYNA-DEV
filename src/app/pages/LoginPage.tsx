import { Link } from 'react-router';
import { Mail, Lock } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-card to-card border border-border rounded-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-[#00B4D8] text-3xl">⬡</div>
              <span className="text-2xl font-semibold text-[#00B4D8]">CYNA</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Connexion</h1>
            <p className="text-muted-foreground">Accédez à votre espace client</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div>
              <label className="block text-foreground font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="votre.email@entreprise.com"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-muted/50 border-border text-[#00B4D8] focus:ring-[#00B4D8]"
                />
                Se souvenir de moi
              </label>
              <Link to="/mot-de-passe-oublie" className="text-[#00B4D8] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00B4D8] text-primary-foreground font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
            >
              Se connecter
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">ou</span>
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
