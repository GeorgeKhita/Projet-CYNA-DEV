import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShoppingCart, User, Menu, X, ChevronDown, Shield, Laptop, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCartCount } from '../../lib/cart';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener('storage', onStorage);
    // Rafraîchir le compteur toutes les secondes (panier localStorage)
    const interval = setInterval(() => setCartCount(getCartCount()), 1000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, []);

  function handleLogout() {
    logout();
    navigate('/connexion');
  }

  const solutions = [
    { id: 'soc', name: 'SOC', description: 'Security Operations Center', color: '#00B4D8', icon: Shield },
    { id: 'edr', name: 'EDR', description: 'Endpoint Detection & Response', color: '#8B5CF6', icon: Laptop },
    { id: 'xdr', name: 'XDR', description: 'Extended Detection & Response', color: '#10B981', icon: Globe },
  ];

  return (
    <nav className="bg-[#0A1628]/95 border-b border-white/10 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="text-[#00B4D8] text-2xl">⬡</div>
            <span className="text-xl font-semibold text-[#00B4D8]">CYNA</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="relative" onMouseLeave={() => setSolutionsOpen(false)}>
              <button onMouseEnter={() => setSolutionsOpen(true)}
                className="flex items-center gap-1 text-gray-300 hover:text-white font-medium transition-colors">
                Solutions
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#0F1F3A] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  {solutions.map(sol => {
                    const Icon = sol.icon;
                    return (
                      <Link key={sol.id} to={`/catalogue`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                        onClick={() => setSolutionsOpen(false)}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${sol.color}20`, border: `1px solid ${sol.color}40` }}>
                          <Icon className="w-4 h-4" style={{ color: sol.color }} />
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{sol.name}</div>
                          <div className="text-gray-400 text-xs">{sol.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                  <div className="border-t border-white/10 px-4 py-3">
                    <Link to="/catalogue" className="text-[#00B4D8] text-sm hover:underline"
                      onClick={() => setSolutionsOpen(false)}>
                      Voir tout le catalogue →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link to="/catalogue" className="text-gray-300 hover:text-white font-medium transition-colors">Tarifs</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white font-medium transition-colors">Contact</Link>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            {/* Panier */}
            <Link to="/panier" className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00B4D8] text-[#0A1628] text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/espace-client"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#00B4D8] flex items-center justify-center text-xs font-bold text-[#0A1628]">
                    {(user.first_name?.[0] ?? '') + (user.last_name?.[0] ?? '')}
                  </div>
                  <span className="text-white text-sm font-medium">{user.first_name}</span>
                </Link>
                <button onClick={handleLogout}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Se déconnecter">
                  <LogOut className="w-5 h-5 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/espace-client" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <User className="w-6 h-6 text-gray-300" />
                </Link>
                <Link to="/connexion"
                  className="px-5 py-2 bg-[#00B4D8] text-[#0A1628] font-medium rounded-lg hover:bg-[#0096B8] transition-colors text-sm">
                  Connexion
                </Link>
              </div>
            )}

            {/* Burger mobile */}
            <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6 text-gray-300" /> : <Menu className="w-6 h-6 text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4 space-y-1">
            {solutions.map(sol => {
              const Icon = sol.icon;
              return (
                <Link key={sol.id} to="/catalogue"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setMobileOpen(false)}>
                  <Icon className="w-5 h-5" style={{ color: sol.color }} />
                  <span className="text-gray-300 font-medium">{sol.name}</span>
                </Link>
              );
            })}
            <Link to="/catalogue" className="block px-3 py-2.5 text-gray-300 hover:text-white font-medium"
              onClick={() => setMobileOpen(false)}>Tarifs</Link>
            <Link to="/contact" className="block px-3 py-2.5 text-gray-300 hover:text-white font-medium"
              onClick={() => setMobileOpen(false)}>Contact</Link>
            <div className="pt-3 flex gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/espace-client"
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg text-center text-sm"
                    onClick={() => setMobileOpen(false)}>Mon espace</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex-1 py-2.5 border border-red-500/30 text-red-400 font-medium rounded-lg text-center text-sm">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/connexion"
                    className="flex-1 py-2.5 bg-[#00B4D8] text-[#0A1628] font-medium rounded-lg text-center text-sm"
                    onClick={() => setMobileOpen(false)}>Connexion</Link>
                  <Link to="/inscription"
                    className="flex-1 py-2.5 border border-[#00B4D8] text-[#00B4D8] font-medium rounded-lg text-center text-sm"
                    onClick={() => setMobileOpen(false)}>Inscription</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
