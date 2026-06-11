import { Link } from 'react-router';
import { User, Mail, Lock, Info, Building } from 'lucide-react';

export function RegisterPage() {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Créer un compte</h1>
            <p className="text-muted-foreground">Rejoignez la communauté CYNA</p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground font-medium mb-2">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Jean"
                    className="w-full bg-muted/50 border border-border rounded-lg pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-foreground font-medium mb-2">Nom</label>
                <input
                  type="text"
                  placeholder="Dupont"
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            {/* Entreprise */}
            <div>
              <label className="block text-foreground font-medium mb-2">Entreprise</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nom de votre entreprise"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-foreground font-medium mb-2">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="votre.email@entreprise.com"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            {/* Mot de passe */}
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

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-foreground font-medium mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#00B4D8] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Minimum 8 caractères, avec au moins une majuscule, une minuscule, un chiffre et un
                  caractère spécial
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00B4D8] text-primary-foreground font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
            >
              Créer mon compte
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Déjà un compte ? </span>
            <Link to="/connexion" className="text-[#00B4D8] hover:underline font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
