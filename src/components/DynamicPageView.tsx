import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SupportedLocale } from '@/lib/i18n';
import { getLocalizedText, isRecordPubliclyVisible } from '@/lib/visibility';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export async function DynamicPageView({
  slug,
  lang,
}: {
  slug: string;
  lang: SupportedLocale;
}) {
  const page = await prisma.websitePage.findUnique({ where: { slug } });

  // Rule 16: Disabled or non-published pages must not be publicly accessible as normal published pages
  if (!page || !isRecordPubliclyVisible(page)) {
    notFound();
  }

  // Section 21: Allow administrator to decide which languages are enabled for individual pages
  if (page.enabledLanguagesJson) {
    try {
      const enabledLangs: string[] = JSON.parse(page.enabledLanguagesJson);
      if (Array.isArray(enabledLangs) && enabledLangs.length === 0) {
        notFound();
      }
    } catch {
      // default allow
    }
  }

  const title = getLocalizedText(lang, page.titleAr, page.titleEn);
  const subtitle = getLocalizedText(lang, page.subtitleAr, page.subtitleEn);
  const content = getLocalizedText(lang, page.contentAr, page.contentEn);

  if (!title && !content) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-12 shadow-sm space-y-6">
          {title && (
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">{title}</h1>
          )}
          {subtitle && (
            <p className="text-base font-medium text-brand-700">{subtitle}</p>
          )}
          {content && (
            <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-6">
              {content}
            </div>
          )}
        </article>
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
