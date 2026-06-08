import { Link } from 'react-router';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A1628] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[#00B4D8] text-2xl">⬡</div>
              <span className="text-xl font-semibold text-[#00B4D8]">CYNA</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Solutions de cybersécurité SaaS pour protéger votre entreprise contre les menaces numériques.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-semibold mb-4">Nos solutions</h3>
            <div className="space-y-2">
              <Link
                to="/catalogue?category=soc"
                className="block text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                SOC – Security Operations
              </Link>
              <Link
                to="/catalogue?category=edr"
                className="block text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                EDR – Endpoint Detection
              </Link>
              <Link
                to="/catalogue?category=xdr"
                className="block text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                XDR – Extended Detection
              </Link>
              <Link
                to="/catalogue"
                className="block text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                Voir tout le catalogue
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <a
                href="mailto:contact@cyna.dev"
                className="flex items-center gap-2 text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                contact@cyna.dev
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-2 text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                +33 1 23 45 67 89
              </a>
              <div className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  123 Avenue de la Sécurité
                  <br />
                  75001 Paris, France
                </span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <div className="space-y-2">
              <Link
                to="/cgu"
                className="block text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                Conditions générales d'utilisation
              </Link>
              <Link
                to="/mentions-legales"
                className="block text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                Mentions légales
              </Link>
              <Link
                to="/confidentialite"
                className="block text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                Politique de confidentialité
              </Link>
              <Link
                to="/contact"
                className="block text-gray-400 hover:text-[#00B4D8] transition-colors text-sm"
              >
                Nous contacter
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Suivez-nous</h3>
            <div className="flex gap-3 flex-wrap">
              <a
                href="#"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#00B4D8]/20 hover:border-[#00B4D8] transition-colors"
              >
                <Facebook className="w-5 h-5 text-gray-400" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#00B4D8]/20 hover:border-[#00B4D8] transition-colors"
              >
                <Twitter className="w-5 h-5 text-gray-400" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#00B4D8]/20 hover:border-[#00B4D8] transition-colors"
              >
                <Linkedin className="w-5 h-5 text-gray-400" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#00B4D8]/20 hover:border-[#00B4D8] transition-colors"
              >
                <Github className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© 2026 CYNA DEV. Tous droits réservés.</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span>Tous les services opérationnels</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
