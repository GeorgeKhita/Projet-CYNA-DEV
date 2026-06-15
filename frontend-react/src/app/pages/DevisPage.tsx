import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { FileText, CheckCircle, ArrowLeft, Send, Building2, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { getCart, clearCart, CartItem } from '../../lib/cart';

const TVA = 0.20;
const SEUIL_HT = 5000;

export function DevisPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    entreprise: '',
    email: '',
    telephone: '',
    message: '',
  });

  useEffect(() => {
    const items = getCart();
    const ht = items.reduce((s, i) => s + i.price * i.quantity, 0);
    if (items.length === 0 || ht <= SEUIL_HT) {
      navigate('/panier', { replace: true });
    } else {
      setCartItems(items);
    }
  }, [navigate]);

  const totalHT  = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalTVA = Math.round(totalHT * TVA * 100) / 100;
  const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100;

  function buildMessage() {
    const lignes = cartItems
      .map(i => `- ${i.name} (${i.duration === 'monthly' ? 'Mensuel' : 'Annuel'}) × ${i.quantity} = ${(i.price * i.quantity).toLocaleString('fr-FR')}€ HT`)
      .join('\n');

    return (
      `Bonjour,\n\nJe souhaite obtenir un devis pour les solutions CYNA suivantes :\n\n${lignes}\n\n` +
      `Total HT : ${totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€\n` +
      `TVA (20%) : ${totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€\n` +
      `Total TTC : ${totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€\n` +
      (form.telephone ? `\nTéléphone : ${form.telephone}\n` : '') +
      (form.entreprise ? `Entreprise : ${form.entreprise}\n` : '') +
      (form.message ? `\nInformations complémentaires :\n${form.message}` : '')
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email:   form.email,
          subject: `Demande de devis — ${totalHT.toLocaleString('fr-FR')}€ HT`,
          message: buildMessage(),
        }),
      });
      if (!res.ok) throw new Error();
      clearCart();
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer ou nous appeler directement.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-3">Demande envoyée !</h1>
          <p className="text-muted-foreground mb-2">
            Notre équipe commerciale a bien reçu votre demande de devis.
          </p>
          <p className="text-muted-foreground mb-8">
            Nous vous contacterons sous <strong>24 h ouvrées</strong> à l'adresse <strong>{form.email}</strong>.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-5xl mx-auto px-6">

        {/* En-tête */}
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">Demande de devis</h1>
        </div>
        <p className="text-muted-foreground mb-10 ml-11">
          Votre panier dépasse 5 000€ HT. Notre équipe commerciale vous prépare une offre sur-mesure.
        </p>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* Récapitulatif panier */}
          <div className="lg:col-span-2">
            <div className="cyna-card p-6 sticky top-6">
              <h2 className="text-lg font-bold text-ink mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-border">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.duration}`} className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.duration === 'monthly' ? 'Mensuel' : 'Annuel'} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-ink flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString('fr-FR')}€ HT
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total HT</span>
                  <span>{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>TVA (20%)</span>
                  <span>{totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-ink">Total TTC</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ink">
                    {totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€ HT
                  </div>
                </div>
              </div>

              <Link to="/panier" className="flex items-center gap-1.5 mt-6 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" /> Modifier le panier
              </Link>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="cyna-card p-8 space-y-5">
              <h2 className="text-lg font-bold text-ink">Vos coordonnées</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    <User className="inline w-4 h-4 mr-1 text-muted-foreground" />Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.prenom}
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                    placeholder="Jean"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    placeholder="Dupont"
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  <Building2 className="inline w-4 h-4 mr-1 text-muted-foreground" />Entreprise
                </label>
                <input
                  type="text"
                  value={form.entreprise}
                  onChange={e => setForm(f => ({ ...f, entreprise: e.target.value }))}
                  placeholder="ACME Corp (optionnel)"
                  className="input w-full"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    <Mail className="inline w-4 h-4 mr-1 text-muted-foreground" />Email professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jean@entreprise.fr"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    <Phone className="inline w-4 h-4 mr-1 text-muted-foreground" />Téléphone
                  </label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                    placeholder="+33 6 12 34 56 78"
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  <MessageSquare className="inline w-4 h-4 mr-1 text-muted-foreground" />Informations complémentaires
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Nombre d'utilisateurs, contraintes techniques, délais souhaités…"
                  className="input w-full resize-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg btn-block"
              >
                {loading ? 'Envoi en cours…' : (
                  <><Send className="w-5 h-5" /> Envoyer ma demande de devis</>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Réponse sous 24 h ouvrées · Lun–Ven 9h–18h
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
