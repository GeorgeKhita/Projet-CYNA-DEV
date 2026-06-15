import { Scale } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-ink mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-3 text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="text-ink font-semibold min-w-[180px] flex-shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">Mentions Légales</h1>
        </div>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : 15 juin 2026</p>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          <Section title="1. Éditeur du site">
            <div className="space-y-2">
              <Row label="Raison sociale" value="CYNA DEV" />
              <Row label="Forme juridique" value="SAS (Société par Actions Simplifiée)" />
              <Row label="Capital social" value="10 000 €" />
              <Row label="Siège social" value="123 Avenue de la Sécurité, 75001 Paris, France" />
              <Row label="SIRET" value="XXX XXX XXX XXXXX" />
              <Row label="N° TVA intracommunautaire" value="FR XX XXX XXX XXX" />
              <Row label="Email" value={<a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>} />
              <Row label="Téléphone" value={<a href="tel:+33123456789" className="text-primary hover:underline">+33 1 23 45 67 89</a>} />
            </div>
          </Section>

          <Section title="2. Directeur de la publication">
            <p>
              Le directeur de la publication du site <strong>cyna.dev</strong> est le représentant légal
              de CYNA DEV.
            </p>
          </Section>

          <Section title="3. Hébergement">
            <div className="space-y-2">
              <Row label="Hébergeur frontend" value="Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis" />
              <Row label="Hébergeur backend" value="Railway Corp., San Francisco, CA, États-Unis" />
            </div>
          </Section>

          <Section title="4. Propriété intellectuelle">
            <p>
              L'ensemble des contenus présents sur le site <strong>cyna.dev</strong> (textes, images,
              graphismes, logo, icônes, sons, logiciels) est la propriété exclusive de CYNA DEV ou de
              ses partenaires, et est protégé par les lois françaises et internationales relatives à la
              propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie
              des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans
              autorisation écrite préalable de CYNA DEV.
            </p>
          </Section>

          <Section title="5. Liens hypertextes">
            <p>
              Le site peut contenir des liens vers des sites tiers. CYNA DEV n'exerce aucun contrôle sur
              ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques.
            </p>
          </Section>

          <Section title="6. Droit applicable">
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les
              tribunaux compétents sont ceux du ressort de Paris.
            </p>
          </Section>

          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
            Pour toute question, contactez-nous à{' '}
            <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
