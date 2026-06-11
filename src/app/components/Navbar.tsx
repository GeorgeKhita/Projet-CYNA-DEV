import { useState } from 'react';
import { Link } from 'react-router';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Shield, Laptop, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NavbarProps {
  cartCount?: number;
}

export function Navbar({ cartCount = 3 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const solutions = [
    { id: 'soc', name: 'SOC', description: 'Security Operations Center', color: '#00B4D8', icon: Shield },
    { id: 'edr', name: 'EDR', description: 'Endpoint Detection & Response', color: '#8B5CF6', icon: Laptop },
    { id: 'xdr', name: 'XDR', description: 'Extended Detection & Response', color: '#10B981', icon: Globe },
  ];

  return (
    <nav className="bg-background/95 border-b border-border sticky top-0 z-50 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="text-[#00B4D8] text-2xl">⬡</div>
            <span className="text-xl font-semibold text-[#00B4D8]">CYNA</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Solutions Dropdown */}
            <div className="relative" onMouseLeave={() => setSolutionsOpen(false)}>
              <button
                onMouseEnter={() => setSolutionsOpen(true)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Solutions
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                  {solutions.map((sol) => {
                    const Icon = sol.icon;
                    return (
                      <Link
                        key={sol.id}
                        to={`/catalogue?category=${sol.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                        onClick={() => setSolutionsOpen(false)}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${sol.color}20`, border: `1px solid ${sol.color}40` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: sol.color }} />
                        </div>
                        <div>
                          <div className="text-foreground font-medium text-sm">{sol.name}</div>
                          <div className="text-muted-foreground text-xs">{sol.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                  <div className="border-t border-border px-4 py-3">
                    <Link
                      to="/catalogue"
                      className="text-[#00B4D8] text-sm hover:underline"
                      onClick={() => setSolutionsOpen(false)}
                    >
                      Voir tout le catalogue →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/catalogue" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
              Tarifs
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-input-background border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <Link to="/panier" className="relative p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6 text-muted-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00B4D8] text-primary-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/espace-client" className="hidden md:block p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <User className="w-6 h-6 text-muted-foreground" />
            </Link>

            <Link
              to="/connexion"
              className="hidden md:block px-5 py-2 bg-[#00B4D8] text-primary-foreground font-medium rounded-lg hover:bg-[#0096B8] transition-colors text-sm"
            >
              Connexion
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6 text-muted-foreground" /> : <Menu className="w-6 h-6 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 space-y-1">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-input-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] text-sm"
              />
            </div>

            {solutions.map((sol) => {
              const Icon = sol.icon;
              return (
                <Link
                  key={sol.id}
                  to={`/catalogue?category=${sol.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-5 h-5" style={{ color: sol.color }} />
                  <span className="text-muted-foreground font-medium">{sol.name}</span>
                  <span className="text-muted-foreground text-sm ml-auto">{sol.description}</span>
                </Link>
              );
            })}

            <Link
              to="/catalogue"
              className="block px-3 py-2.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Tarifs
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-3 flex gap-3">
              <Link
                to="/connexion"
                className="flex-1 py-2.5 bg-[#00B4D8] text-primary-foreground font-medium rounded-lg text-center text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="flex-1 py-2.5 border border-[#00B4D8] text-[#00B4D8] font-medium rounded-lg text-center text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Inscription
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
