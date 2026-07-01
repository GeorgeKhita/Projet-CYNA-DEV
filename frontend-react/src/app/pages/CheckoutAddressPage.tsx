import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Check, MapPin, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Address {
  id: number;
  first_name: string;
  last_name: string;
  address1: string | null;
  address2: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string | null;
}

interface AddressForm {
  first_name: string;
  last_name: string;
  address1: string;
  address2: string;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
}

const EMPTY_FORM: AddressForm = {
  first_name: '', last_name: '', address1: '', address2: '',
  city: '', postal_code: '', country: 'FR', phone_number: '',
};

const COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Suisse' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'ES', label: 'Espagne' },
  { code: 'IT', label: 'Italie' },
  { code: 'NL', label: 'Pays-Bas' },
  { code: 'GB', label: 'Royaume-Uni' },
  { code: 'US', label: 'États-Unis' },
];

const NEXT_STEP = '/checkout/paiement';

export function CheckoutAddressPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addresses, setAddresses]         = useState<Address[]>([]);
  const [loadingAddr, setLoadingAddr]     = useState(false);
  const [selectedId, setSelectedId]       = useState<number | 'new' | null>(null);
  const [form, setForm]                   = useState<AddressForm>(EMPTY_FORM);
  const [saveAddress, setSaveAddress]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');

  const steps = [
    { id: 1, name: t('checkout.step_identification'), active: false, completed: true  },
    { id: 2, name: t('checkout.step_address'),        active: true,  completed: false },
    { id: 3, name: t('checkout.step_payment'),        active: false, completed: false },
    { id: 4, name: t('checkout.step_confirmation'),   active: false, completed: false },
  ];

  // Précharge le form avec les infos invité si disponibles
  useEffect(() => {
    const guest = sessionStorage.getItem('cyna_guest');
    if (guest) {
      const g = JSON.parse(guest);
      setForm(prev => ({
        ...prev,
        first_name: g.first_name ?? '',
        last_name:  g.last_name  ?? '',
      }));
    }
  }, []);

  // Charge les adresses enregistrées pour les utilisateurs connectés
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingAddr(true);
    api.get<Address[]>('/user/addresses')
      .then(data => {
        setAddresses(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        } else {
          setSelectedId('new');
        }
      })
      .catch(() => setSelectedId('new'))
      .finally(() => setLoadingAddr(false));
  }, [isAuthenticated]);

  // Guest → formulaire direct
  useEffect(() => {
    if (!isAuthenticated) setSelectedId('new');
  }, [isAuthenticated]);

  function setField(field: keyof AddressForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  function storeAndNavigate(address: Partial<Address> | AddressForm) {
    sessionStorage.setItem('cyna_billing_address', JSON.stringify(address));
    navigate(NEXT_STEP);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Utilisation d'une adresse existante
    if (selectedId !== 'new' && selectedId !== null) {
      const addr = addresses.find(a => a.id === selectedId);
      if (addr) storeAndNavigate(addr);
      return;
    }

    // Formulaire nouvelle adresse
    setSubmitting(true);
    try {
      if (isAuthenticated && saveAddress) {
        const saved = await api.post<Address>('/user/addresses', form);
        storeAndNavigate(saved);
      } else {
        storeAndNavigate(form);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation de l\'adresse.');
    } finally {
      setSubmitting(false);
    }
  }

  const showForm = selectedId === 'new';

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">

        {/* Barre de progression */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed
                      ? 'bg-[#10B981] text-white'
                      : step.active
                        ? 'bg-[#00B4D8] text-[#06222C] shadow-[var(--shadow-cyan)]'
                        : 'bg-bg-subtle border border-border text-muted-foreground'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-semibold hidden sm:block ${step.active || step.completed ? 'text-ink' : 'text-muted-foreground'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-[#E5E9F0]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
            <h1 className="text-3xl font-bold text-ink mb-2">{t('checkout.address_title')}</h1>
            <p className="text-muted-foreground mb-8">{t('checkout.address_subtitle')}</p>

            {error && (
              <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Adresses enregistrées (utilisateurs connectés) */}
            {isAuthenticated && (
              <>
                {loadingAddr ? (
                  <div className="flex items-center gap-3 text-muted-foreground mb-6">
                    <div className="w-4 h-4 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
                    {t('checkout.address_loading')}
                  </div>
                ) : addresses.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {t('checkout.address_saved_title')}
                    </h2>
                    <div className="space-y-3">
                      {addresses.map(addr => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedId === addr.id
                              ? 'border-[#00B4D8] bg-[#00B4D8]/5'
                              : 'border-border hover:border-[#00B4D8]/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={addr.id}
                            checked={selectedId === addr.id}
                            onChange={() => setSelectedId(addr.id)}
                            className="mt-1 accent-[#00B4D8]"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-ink">
                              {addr.first_name} {addr.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {addr.address1 && <span>{addr.address1}<br /></span>}
                              {addr.address2 && <span>{addr.address2}<br /></span>}
                              {addr.postal_code} {addr.city} · {addr.country}
                              {addr.phone_number && <span> · {addr.phone_number}</span>}
                            </div>
                          </div>
                          {selectedId === addr.id && (
                            <Check className="w-5 h-5 text-[#00B4D8] flex-shrink-0 mt-0.5" />
                          )}
                        </label>
                      ))}

                      {/* Option nouvelle adresse */}
                      <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedId === 'new'
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5'
                          : 'border-border hover:border-[#00B4D8]/50'
                      }`}>
                        <input
                          type="radio"
                          name="address"
                          value="new"
                          checked={selectedId === 'new'}
                          onChange={() => setSelectedId('new')}
                          className="accent-[#00B4D8]"
                        />
                        <Plus className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-ink">{t('checkout.address_new')}</span>
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Formulaire nouvelle adresse */}
            {showForm && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ink text-sm mb-2">{t('checkout.address_first_name')} *</label>
                    <input type="text" value={form.first_name} onChange={setField('first_name')} required
                      placeholder="Prénom" className="field" />
                  </div>
                  <div>
                    <label className="block text-ink text-sm mb-2">{t('checkout.address_last_name')} *</label>
                    <input type="text" value={form.last_name} onChange={setField('last_name')} required
                      placeholder="Nom" className="field" />
                  </div>
                </div>

                <div>
                  <label className="block text-ink text-sm mb-2">{t('checkout.address_line1')} *</label>
                  <input type="text" value={form.address1} onChange={setField('address1')} required
                    placeholder="12 rue de la Paix" className="field" />
                </div>

                <div>
                  <label className="block text-ink text-sm mb-2">
                    {t('checkout.address_line2')}
                    <span className="ml-2 text-xs text-muted-foreground font-normal">{t('checkout.address_line2_hint')}</span>
                  </label>
                  <input type="text" value={form.address2} onChange={setField('address2')}
                    placeholder="Bâtiment A, Appartement 3" className="field" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ink text-sm mb-2">{t('checkout.address_postal_code')} *</label>
                    <input type="text" value={form.postal_code} onChange={setField('postal_code')} required
                      placeholder="75001" className="field" />
                  </div>
                  <div>
                    <label className="block text-ink text-sm mb-2">{t('checkout.address_city')} *</label>
                    <input type="text" value={form.city} onChange={setField('city')} required
                      placeholder="Paris" className="field" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ink text-sm mb-2">{t('checkout.address_country')} *</label>
                    <select value={form.country} onChange={setField('country')} required className="field">
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-ink text-sm mb-2">
                      {t('checkout.address_phone')}
                      <span className="ml-2 text-xs text-muted-foreground font-normal">{t('checkout.address_phone_hint')}</span>
                    </label>
                    <input type="tel" value={form.phone_number} onChange={setField('phone_number')}
                      placeholder="+33 6 12 34 56 78" className="field" />
                  </div>
                </div>

                {/* Case à cocher enregistrer (connectés seulement) */}
                {isAuthenticated && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={e => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 accent-[#00B4D8]"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-ink transition-colors">
                      {t('checkout.address_save')}
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Bouton submit */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/checkout/identification')}
              className="text-muted-foreground hover:text-ink text-sm font-semibold transition-colors flex items-center gap-2"
            >
              ← Retour
            </button>
            <button
              type="submit"
              disabled={submitting || (isAuthenticated && loadingAddr)}
              className="btn btn-primary btn-lg"
            >
              <MapPin className="w-5 h-5" />
              {submitting ? t('checkout.address_submitting') : t('checkout.address_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
