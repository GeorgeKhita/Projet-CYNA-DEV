import { FileText } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-ink mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-3 text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

export function CGUPage() {
  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">Conditions Générales d'Utilisation</h1>
        </div>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : 15 juin 2026</p>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          <Section title="1. Objet">
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
              de la plateforme CYNA, éditée par CYNA DEV, ainsi que de l'ensemble des services proposés
              sur le site <strong>cyna.dev</strong>.
            </p>
            <p>
              En accédant à la plateforme, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez
              pas ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </Section>

          <Section title="2. Description des services">
            <p>
              CYNA propose des solutions SaaS de cybersécurité à destination des entreprises, incluant :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>SOC</strong> – Security Operations Center : surveillance et détection des incidents.</li>
              <li><strong>EDR</strong> – Endpoint Detection & Response : protection des terminaux.</li>
              <li><strong>XDR</strong> – Extended Detection & Response : unification de la détection étendue.</li>
            </ul>
            <p>
              Les services sont accessibles par abonnement mensuel ou annuel, après création d'un compte
              et validation du paiement.
            </p>
          </Section>

          <Section title="3. Accès et inscription">
            <p>
              L'accès aux services nécessite la création d'un compte avec une adresse e-mail valide et un
              mot de passe. Vous vous engagez à fournir des informations exactes et à les maintenir à jour.
            </p>
            <p>
              Vous êtes responsable de la confidentialité de vos identifiants. Toute utilisation de votre
              compte est réputée effectuée par vous.
            </p>
          </Section>

          <Section title="4. Utilisation acceptable">
            <p>Il est interdit d'utiliser nos services pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Toute activité illégale ou frauduleuse.</li>
              <li>Tenter de contourner les mesures de sécurité de la plateforme.</li>
              <li>Reproduire, revendre ou redistribuer nos services sans autorisation écrite.</li>
              <li>Introduire des virus, logiciels malveillants ou tout code nuisible.</li>
            </ul>
          </Section>

          <Section title="5. Tarifs et facturation">
            <p>
              Les prix affichés sur la plateforme sont exprimés en euros <strong>hors taxes (HT)</strong>.
              La TVA applicable (20 %) est ajoutée lors du récapitulatif de commande.
            </p>
            <p>
              Le paiement est effectué en ligne, de manière sécurisée, via Stripe (conforme PCI-DSS).
              En cas d'échec de paiement, l'accès aux services peut être suspendu.
            </p>
            <p>
              Pour les commandes dépassant 5 000 € HT, un devis personnalisé est établi sur demande.
            </p>
          </Section>

          <Section title="6. Résiliation et annulation">
            <p>
              Vous pouvez annuler votre abonnement à tout moment depuis votre espace client. L'annulation
              prend effet à la fin de la période en cours, sans remboursement au prorata.
            </p>
            <p>
              CYNA DEV se réserve le droit de suspendre ou résilier un compte en cas de non-respect des
              présentes CGU, sans préavis ni indemnité.
            </p>
          </Section>

          <Section title="7. Propriété intellectuelle">
            <p>
              L'ensemble des éléments de la plateforme (marque, logo, contenus, interfaces, code source)
              est la propriété exclusive de CYNA DEV et est protégé par le droit de la propriété
              intellectuelle. Toute reproduction sans autorisation est interdite.
            </p>
          </Section>

          <Section title="8. Limitation de responsabilité">
            <p>
              CYNA DEV s'engage à assurer la disponibilité de ses services avec un objectif de 99,9 %
              d'uptime. En cas d'interruption, notre responsabilité est limitée au remboursement de la
              période d'indisponibilité au prorata.
            </p>
            <p>
              CYNA DEV ne saurait être tenu responsable des dommages indirects résultant de l'utilisation
              de ses services.
            </p>
          </Section>

          <Section title="9. Modification des CGU">
            <p>
              CYNA DEV se réserve le droit de modifier les présentes CGU à tout moment. Les modifications
              entrent en vigueur dès leur publication sur la plateforme. L'utilisation continue des services
              après modification vaut acceptation des nouvelles CGU.
            </p>
          </Section>

          <Section title="10. Droit applicable">
            <p>
              Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation
              ou exécution relève de la compétence exclusive des tribunaux de Paris.
            </p>
          </Section>

          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
            Pour toute question relative aux présentes CGU, contactez-nous à{' '}
            <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
