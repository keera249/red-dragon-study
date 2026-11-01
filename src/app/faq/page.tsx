import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import { getLocalizedText } from '@/lib/visibility';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

export default async function FaqPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const faqs = await prisma.faqItem.findMany({
    where: { isEnabled: true, status: 'PUBLISHED' },
    orderBy: { displayOrder: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">{t.nav.faq}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {lang === 'ar'
              ? 'إجابات مفصلة لأهم الأسئلة المتعلقة بالقبول الجامعي والمنح الدراسية في الصين.'
              : 'Detailed answers to common questions regarding university admissions and scholarships in China.'}
          </p>
        </div>

        {faqs.length > 0 && (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2"
              >
                <h2 className="text-base font-bold text-slate-900">
                  {getLocalizedText(lang, faq.questionAr, faq.questionEn)}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {getLocalizedText(lang, faq.answerAr, faq.answerEn)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
