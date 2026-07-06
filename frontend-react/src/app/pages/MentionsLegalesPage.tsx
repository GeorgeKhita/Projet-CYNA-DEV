import { Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">{t('mentions_legales.title')}</h1>
        </div>
        <p className="text-muted-foreground mb-10">{t('mentions_legales.last_update')}</p>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          <Section title={t('mentions_legales.s1_title')}>
            <div className="space-y-2">
              <Row label={t('mentions_legales.row_company_name')} value="CYNA DEV" />
              <Row label={t('mentions_legales.row_legal_form')} value={t('mentions_legales.row_legal_form_value')} />
              <Row label={t('mentions_legales.row_capital')} value="10 000 €" />
              <Row label={t('mentions_legales.row_address')} value={t('mentions_legales.row_address_value')} />
              <Row label={t('mentions_legales.row_siret')} value="XXX XXX XXX XXXXX" />
              <Row label={t('mentions_legales.row_vat')} value="FR XX XXX XXX XXX" />
              <Row label={t('mentions_legales.row_email')} value={<a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>} />
              <Row label={t('mentions_legales.row_phone')} value={<a href="tel:+33123456789" className="text-primary hover:underline">+33 1 23 45 67 89</a>} />
            </div>
          </Section>

          <Section title={t('mentions_legales.s2_title')}>
            <p>{t('mentions_legales.s2_p1')}</p>
          </Section>

          <Section title={t('mentions_legales.s3_title')}>
            <div className="space-y-2">
              <Row label={t('mentions_legales.row_host_frontend')} value={t('mentions_legales.row_host_frontend_value')} />
              <Row label={t('mentions_legales.row_host_backend')} value={t('mentions_legales.row_host_backend_value')} />
            </div>
          </Section>

          <Section title={t('mentions_legales.s4_title')}>
            <p>{t('mentions_legales.s4_p1')}</p>
            <p>{t('mentions_legales.s4_p2')}</p>
          </Section>

          <Section title={t('mentions_legales.s5_title')}>
            <p>{t('mentions_legales.s5_p1')}</p>
          </Section>

          <Section title={t('mentions_legales.s6_title')}>
            <p>{t('mentions_legales.s6_p1')}</p>
          </Section>

          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
            {t('mentions_legales.contact')}{' '}
            <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
