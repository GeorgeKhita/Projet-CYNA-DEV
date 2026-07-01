import { useNavigate, Link } from 'react-router';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CheckoutAddressPage() {
  const navigate  = useNavigate();
  const { t } = useTranslation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/checkout/paiement');
  }

  return (
    <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-3 mb-2">
        <MapPin className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold text-ink">{t('checkout.address_title', 'Adresse de facturation')}</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        {t('checkout.address_subtitle', 'Renseignez l\'adresse associée à votre compte.')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-ink mb-2">{t('checkout.address_street', 'Rue')}</label>
          <input
            type="text"
            placeholder="12 rue de la Paix"
            className="field"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-ink mb-2">{t('checkout.address_zip', 'Code postal')}</label>
            <input type="text" placeholder="75001" className="field" required />
          </div>
          <div>
            <label className="block text-ink mb-2">{t('checkout.address_city', 'Ville')}</label>
            <input type="text" placeholder="Paris" className="field" required />
          </div>
        </div>

        <div>
          <label className="block text-ink mb-2">{t('checkout.address_country', 'Pays')}</label>
          <input type="text" placeholder="France" defaultValue="France" className="field" required />
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-block">
          {t('checkout.continue_to_payment', 'Continuer vers le paiement')}
        </button>
      </form>

      <div className="mt-6 text-sm">
        <Link to="/checkout/identification" className="text-muted-foreground hover:text-primary transition-colors">
          ← {t('checkout.back', 'Retour')}
        </Link>
      </div>
    </div>
  );
}
