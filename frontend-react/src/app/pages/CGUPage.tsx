import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-ink mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-3 text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

export function CGUPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-[#00B4D8]" />
          <h1 className="text-4xl font-bold text-ink">{t('cgu.title')}</h1>
        </div>
        <p className="text-muted-foreground mb-10">{t('cgu.last_update')}</p>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          <Section title={t('cgu.s1_title')}>
            <p>{t('cgu.s1_p1')}</p>
            <p>{t('cgu.s1_p2')}</p>
          </Section>

          <Section title={t('cgu.s2_title')}>
            <p>{t('cgu.s2_intro')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('cgu.s2_li1')}</li>
              <li>{t('cgu.s2_li2')}</li>
              <li>{t('cgu.s2_li3')}</li>
            </ul>
            <p>{t('cgu.s2_p1')}</p>
          </Section>

          <Section title={t('cgu.s3_title')}>
            <p>{t('cgu.s3_p1')}</p>
            <p>{t('cgu.s3_p2')}</p>
          </Section>

          <Section title={t('cgu.s4_title')}>
            <p>{t('cgu.s4_intro')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('cgu.s4_li1')}</li>
              <li>{t('cgu.s4_li2')}</li>
              <li>{t('cgu.s4_li3')}</li>
              <li>{t('cgu.s4_li4')}</li>
            </ul>
          </Section>

          <Section title={t('cgu.s5_title')}>
            <p>{t('cgu.s5_p1')}</p>
            <p>{t('cgu.s5_p2')}</p>
            <p>{t('cgu.s5_p3')}</p>
          </Section>

          <Section title={t('cgu.s6_title')}>
            <p>{t('cgu.s6_p1')}</p>
            <p>{t('cgu.s6_p2')}</p>
          </Section>

          <Section title={t('cgu.s7_title')}>
            <p>{t('cgu.s7_p1')}</p>
          </Section>

          <Section title={t('cgu.s8_title')}>
            <p>{t('cgu.s8_p1')}</p>
            <p>{t('cgu.s8_p2')}</p>
          </Section>

          <Section title={t('cgu.s9_title')}>
            <p>{t('cgu.s9_p1')}</p>
          </Section>

          <Section title={t('cgu.s10_title')}>
            <p>{t('cgu.s10_p1')}</p>
          </Section>

          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
            {t('cgu.contact')}{' '}
            <a href="mailto:contact@cyna.dev" className="text-primary hover:underline">contact@cyna.dev</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
