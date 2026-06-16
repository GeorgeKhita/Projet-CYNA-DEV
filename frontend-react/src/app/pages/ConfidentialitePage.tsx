import { ShieldCheck } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-ink mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-3 text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

export function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">Politique de Confidentialité</h1>
        </div>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : 15 juin 2026</p>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          <Section title="1. Responsable du traitement">
            <p>
              Le responsable du traitement des données personnelles collectées via la plateforme
              <strong> cyna.dev</strong> est <strong>CYNA DEV</strong>, SAS au capital de 10 000 €,
              dont le siège social est situé au 123 Avenue de la Sécurité, 75001 Paris, France.
            </p>
            <p>
              Contact DPO :{' '}
              <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>
            </p>
          </Section>

          <Section title="2. Données collectées">
            <p>Dans le cadre de nos services, nous collectons les données suivantes :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Données d'identification</strong> : nom, prénom, adresse e-mail, nom d'entreprise.</li>
              <li><strong>Données de connexion</strong> : adresse IP, logs d'accès, données d'authentification (2FA).</li>
              <li><strong>Données de facturation</strong> : adresse de facturation, historique des commandes et abonnements. Les données de carte bancaire sont traitées directement par Stripe et ne sont jamais stockées sur nos serveurs.</li>
              <li><strong>Données d'utilisation</strong> : pages visitées, interactions avec la plateforme, préférences.</li>
            </ul>
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Vos données sont collectées pour les finalités suivantes :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gestion de votre compte et authentification sécurisée (base légale : exécution du contrat).</li>
              <li>Traitement des commandes et facturation (base légale : exécution du contrat).</li>
              <li>Fourniture et amélioration de nos services de cybersécurité (base légale : intérêt légitime).</li>
              <li>Envoi de communications transactionnelles (confirmations, factures) (base légale : exécution du contrat).</li>
              <li>Respect de nos obligations légales (base légale : obligation légale).</li>
            </ul>
          </Section>

          <Section title="4. Durée de conservation">
            <ul className="list-disc pl-5 space-y-1">
              <li>Données de compte : durée de la relation contractuelle + 3 ans.</li>
              <li>Données de facturation : 10 ans (obligation comptable légale).</li>
              <li>Logs de connexion : 12 mois.</li>
              <li>Données de support : 3 ans à compter de la clôture du ticket.</li>
            </ul>
          </Section>

          <Section title="5. Partage des données">
            <p>
              Vos données peuvent être transmises aux sous-traitants suivants, dans le strict cadre de
              la fourniture du service :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stripe Inc.</strong> – traitement des paiements (conforme PCI-DSS).</li>
              <li><strong>Vercel Inc.</strong> – hébergement du frontend.</li>
              <li><strong>Railway Corp.</strong> – hébergement du backend et des données.</li>
            </ul>
            <p>
              Nous ne vendons, ne louons ni ne partageons vos données avec des tiers à des fins
              commerciales. Tout transfert hors UE est encadré par les garanties appropriées
              (clauses contractuelles types de la Commission européenne).
            </p>
          </Section>

          <Section title="6. Vos droits (RGPD)">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles.</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données.</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré (disponible depuis votre espace client).</li>
              <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements.</li>
              <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données.</li>
            </ul>
            <p>
              Pour exercer ces droits, adressez votre demande à{' '}
              <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>.
              Nous répondrons dans un délai maximum de 30 jours.
            </p>
            <p>
              Vous pouvez également introduire une réclamation auprès de la{' '}
              <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :
              {' '}<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>.
            </p>
          </Section>

          <Section title="7. Sécurité">
            <p>
              CYNA DEV met en œuvre des mesures techniques et organisationnelles adaptées pour protéger
              vos données contre tout accès non autorisé, perte ou divulgation : chiffrement TLS en
              transit, authentification à deux facteurs (2FA), journalisation des accès, cloisonnement
              des environnements.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              Le site utilise uniquement des cookies strictement nécessaires au fonctionnement
              (session, authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </Section>

          <Section title="9. Modifications">
            <p>
              La présente politique peut être mise à jour à tout moment. La date de dernière mise à
              jour est indiquée en haut de cette page. Nous vous informerons de toute modification
              substantielle par e-mail.
            </p>
          </Section>

          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
            Pour toute question relative à la protection de vos données, contactez-nous à{' '}
            <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
