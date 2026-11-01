import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { CompareTableClient } from '@/components/CompareTableClient';

export default async function CompareUniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const allPublished = await prisma.university.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, nameEn: true, nameAr: true },
    orderBy: { nameEn: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t.nav.compare}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {lang === 'ar'
              ? 'قارن بين الجامعات الصينية جنباً إلى جنب من حيث التخصصات والرسوم والمنح ومتطلبات القبول بدون الحاجة لإنشاء حساب.'
              : 'Compare Chinese universities side by side across programs, fees, scholarships, and admission requirements without registration.'}
          </p>
        </div>

        <CompareTableClient lang={lang} allPublishedUniversities={allPublished} />
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
