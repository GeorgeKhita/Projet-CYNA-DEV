import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Check } from 'lucide-react';
import { useCheckoutStore } from '../store/checkoutStore';
import { useAuthStore } from '../store/authStore';

const steps = [
  { id: 1, name: 'Identification', active: false, completed: true },
  { id: 2, name: 'Adresse',        active: true,  completed: false },
  { id: 3, name: 'Paiement',       active: false, completed: false },
  { id: 4, name: 'Confirmation',   active: false, completed: false },
];

const euCountries = [
  { code: 'FR', label: 'France' }, { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Suisse' }, { code: 'LU', label: 'Luxembourg' },
  { code: 'DE', label: 'Allemagne' }, { code: 'ES', label: 'Espagne' },
  { code: 'IT', label: 'Italie' }, { code: 'NL', label: 'Pays-Bas' },
  { code: 'PT', label: 'Portugal' }, { code: 'AT', label: 'Autriche' },
  { code: 'PL', label: 'Pologne' }, { code: 'SE', label: 'Suède' },
  { code: 'DK', label: 'Danemark' }, { code: 'FI', label: 'Finlande' },
  { code: 'IE', label: 'Irlande' },
];

export function CheckoutAddressPage() {
  const user = useAuthStore((s) => s.user);
  const { setBillingAddress } = useCheckoutStore();
  const navigate = useNavigate();

  const [company, setCompany]     = useState(user?.company ?? '');
  const [address, setAddress]     = useState('');
  const [city, setCity]           = useState('');
  const [postal, setPostal]       = useState('');
  const [country, setCountry]     = useState('FR');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = "L'adresse est requise";
    if (!city.trim()) e.city = 'La ville est requise';
    if (!postal.trim()) e.postal = 'Le code postal est requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBillingAddress({ company, address, city, postal_code: postal, country });
    navigate('/checkout/paiement');
  };

  const inputCls = (field: string) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent`;

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.completed ? 'bg-[#10B981] text-white' : step.active ? 'bg-[#00B4D8] text-[#0A1628]' : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-medium hidden sm:block ${step.active || step.completed ? 'text-white' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Adresse de facturation</h1>
          <p className="text-gray-400 mb-8">Renseignez l'adresse de facturation de votre entreprise</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">Entreprise</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)}
                type="text" placeholder="Nom de votre entreprise" className={inputCls('company')} />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Adresse</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                type="text" placeholder="12 rue de la Paix" className={inputCls('address')} />
              {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Code postal</label>
                <input value={postal} onChange={(e) => setPostal(e.target.value)}
                  type="text" placeholder="75001" className={inputCls('postal')} />
                {errors.postal && <p className="text-red-400 text-sm mt-1">{errors.postal}</p>}
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Ville</label>
                <input value={city} onChange={(e) => setCity(e.target.value)}
                  type="text" placeholder="Paris" className={inputCls('city')} />
                {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Pays</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}>
                {euCountries.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0F1F3A] text-gray-200">{c.label}</option>
                ))}
              </select>
            </div>

            <button type="submit"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
              Continuer
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/panier" className="text-sm text-gray-400 hover:text-[#00B4D8] transition-colors">
              ← Retour au panier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
