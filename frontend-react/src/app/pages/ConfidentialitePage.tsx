import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-ink mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-3 text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

export function ConfidentialitePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">{t('confidentialite.title')}</h1>
        </div>
        <p className="text-muted-foreground mb-10">{t('confidentialite.last_update')}</p>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          <Section title={t('confidentialite.s1_title')}>
            <p>{t('confidentialite.s1_p1')}</p>
            <p>
              {t('confidentialite.s1_dpo_label')}{' '}
              <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>
            </p>
          </Section>

          <Section title={t('confidentialite.s2_title')}>
            <p>{t('confidentialite.s2_intro')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('confidentialite.s2_li1')}</li>
              <li>{t('confidentialite.s2_li2')}</li>
              <li>{t('confidentialite.s2_li3')}</li>
              <li>{t('confidentialite.s2_li4')}</li>
            </ul>
          </Section>

          <Section title={t('confidentialite.s3_title')}>
            <p>{t('confidentialite.s3_intro')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('confidentialite.s3_li1')}</li>
              <li>{t('confidentialite.s3_li2')}</li>
              <li>{t('confidentialite.s3_li3')}</li>
              <li>{t('confidentialite.s3_li4')}</li>
              <li>{t('confidentialite.s3_li5')}</li>
            </ul>
          </Section>

          <Section title={t('confidentialite.s4_title')}>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('confidentialite.s4_li1')}</li>
              <li>{t('confidentialite.s4_li2')}</li>
              <li>{t('confidentialite.s4_li3')}</li>
              <li>{t('confidentialite.s4_li4')}</li>
            </ul>
          </Section>

          <Section title={t('confidentialite.s5_title')}>
            <p>{t('confidentialite.s5_p1')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('confidentialite.s5_li1')}</li>
              <li>{t('confidentialite.s5_li2')}</li>
              <li>{t('confidentialite.s5_li3')}</li>
            </ul>
            <p>{t('confidentialite.s5_p2')}</p>
          </Section>

          <Section title={t('confidentialite.s6_title')}>
            <p>{t('confidentialite.s6_intro')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('confidentialite.s6_li1')}</li>
              <li>{t('confidentialite.s6_li2')}</li>
              <li>{t('confidentialite.s6_li3')}</li>
              <li>{t('confidentialite.s6_li4')}</li>
              <li>{t('confidentialite.s6_li5')}</li>
              <li>{t('confidentialite.s6_li6')}</li>
            </ul>
            <p>
              {t('confidentialite.s6_rights_request')}{' '}
              <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>.
              {' '}{t('confidentialite.s6_response_delay')}
            </p>
            <p>
              {t('confidentialite.s6_p2_pre')}
              {' '}<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>.
            </p>
          </Section>

          <Section title={t('confidentialite.s7_title')}>
            <p>{t('confidentialite.s7_p1')}</p>
          </Section>

          <Section title={t('confidentialite.s8_title')}>
            <p>{t('confidentialite.s8_p1')}</p>
          </Section>

          <Section title={t('confidentialite.s9_title')}>
            <p>{t('confidentialite.s9_p1')}</p>
          </Section>

          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
            {t('confidentialite.contact')}{' '}
            <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
