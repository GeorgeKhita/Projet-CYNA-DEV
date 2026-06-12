import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { ShoppingCart, Menu, X, ChevronDown, Shield, Laptop, Globe, LogOut, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '../../context/AuthContext';
import { getCartCount } from '../../lib/cart';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setCartCount(getCartCount());
    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener('storage', onStorage);
    const interval = setInterval(() => setCartCount(getCartCount()), 1000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate('/connexion');
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  }

  const isActive = (path: string) => location.pathname === path;

  const solutions = [
    { id: 'soc', name: 'SOC', description: 'Security Operations Center',     color: '#00B4D8', icon: Shield },
    { id: 'edr', name: 'EDR', description: 'Endpoint Detection & Response',   color: '#7C5CFC', icon: Laptop },
    { id: 'xdr', name: 'XDR', description: 'Extended Detection & Response',   color: '#10B981', icon: Globe },
  ];

  return (
    <nav
      className={`bg-background/90 sticky top-0 z-50 backdrop-blur-xl transition-[box-shadow,border-color] duration-300 border-b ${
        scrolled ? 'border-border shadow-[0_4px_24px_rgba(10,22,40,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]' : 'border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5">
        <div className="flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0098B7] flex items-center justify-center text-white text-lg shadow-[0_6px_16px_rgba(0,180,216,0.35)]">
              ⬡
            </div>
            <span className="text-xl font-bold tracking-tight text-ink">CYNA</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="relative" onMouseLeave={() => setSolutionsOpen(false)}>
              <button
                onMouseEnter={() => setSolutionsOpen(true)}
                className="nav-link flex items-center gap-1"
              >
                Solutions
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 pt-3 w-80">
                  <div className="bg-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(10,22,40,0.14)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.50)] overflow-hidden">
                    {solutions.map(sol => {
                      const Icon = sol.icon;
                      return (
                        <Link
                          key={sol.id}
                          to="/catalogue"
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-subtle transition-colors"
                          onClick={() => setSolutionsOpen(false)}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${sol.color}15`, border: `1px solid ${sol.color}30` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: sol.color }} />
                          </div>
                          <div>
                            <div className="text-ink font-semibold text-sm">{sol.name}</div>
                            <div className="text-muted-foreground text-xs">{sol.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                    <Link
                      to="/catalogue"
                      className="block border-t border-border px-4 py-3 text-primary text-sm font-semibold hover:bg-bg-subtle transition-colors"
                      onClick={() => setSolutionsOpen(false)}
                    >
                      Voir tout le catalogue →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link to="/catalogue" className={`nav-link ${isActive('/catalogue') ? 'is-active' : ''}`}>Tarifs</Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'is-active' : ''}`}>Contact</Link>
          </div>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-bg-subtle border border-border rounded-full pl-10 pr-4 py-2.5 text-ink placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/15 text-sm transition-all"
              />
            </div>
          </form>

          {/* Actions droite */}
          <div className="flex items-center gap-2.5">
            {/* Toggle dark/light */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 hover:bg-bg-subtle rounded-xl transition-colors"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-[#F59E0B]" />
                : <Moon className="w-5 h-5 text-ink-soft" />
              }
            </button>

            {/* Panier */}
            <Link to="/panier" className="relative p-2.5 hover:bg-bg-subtle rounded-xl transition-colors">
              <ShoppingCart className="w-5 h-5 text-ink-soft" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,180,216,0.45)]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/espace-client"
                  className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 bg-bg-subtle border border-border rounded-full hover:border-primary/40 hover:bg-background transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0098B7] flex items-center justify-center text-xs font-bold text-white">
                    {(user.first_name?.[0] ?? '') + (user.last_name?.[0] ?? '')}
                  </div>
                  <span className="text-ink text-sm font-semibold">{user.first_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-destructive/10 rounded-xl transition-colors group"
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/connexion" className="btn btn-dark">
                  Connexion
                </Link>
              </div>
            )}

            {/* Burger mobile */}
            <button
              className="lg:hidden p-2.5 hover:bg-bg-subtle rounded-xl transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6 text-ink" /> : <Menu className="w-6 h-6 text-ink" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 space-y-1">
            <form onSubmit={handleSearch} className="md:hidden mb-3">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-bg-subtle border border-border rounded-full pl-10 pr-4 py-2.5 text-ink placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </form>
            {solutions.map(sol => {
              const Icon = sol.icon;
              return (
                <Link
                  key={sol.id}
                  to="/catalogue"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-subtle transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-5 h-5" style={{ color: sol.color }} />
                  <span className="text-ink font-semibold">{sol.name}</span>
                </Link>
              );
            })}
            <Link to="/catalogue" className="block px-3 py-2.5 text-ink-soft hover:text-ink font-semibold" onClick={() => setMobileOpen(false)}>Tarifs</Link>
            <Link to="/contact" className="block px-3 py-2.5 text-ink-soft hover:text-ink font-semibold" onClick={() => setMobileOpen(false)}>Contact</Link>
            <div className="pt-3 flex gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/espace-client" className="btn btn-ghost btn-block" onClick={() => setMobileOpen(false)}>Mon espace</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn btn-danger btn-block">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="btn btn-dark btn-block" onClick={() => setMobileOpen(false)}>Connexion</Link>
                  <Link to="/inscription" className="btn btn-outline btn-block" onClick={() => setMobileOpen(false)}>Inscription</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
