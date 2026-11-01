import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { SupportedLocale, UI_LABELS } from '@/lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export async function PublicHeader({ lang }: { lang: SupportedLocale }) {
  const [sys, navItems, pages] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.navigationItem.findMany({
      where: { location: 'HEADER', isEnabled: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.websitePage.findMany({
      select: { slug: true, isEnabled: true, status: true },
    }),
  ]);

  // Rule 16: Disabled or non-published pages must not appear in public navigation!
  const disabledSlugs = new Set(
    pages
      .filter((p) => !p.isEnabled || p.status !== 'PUBLISHED')
      .map((p) => `/${p.slug}`)
  );

  const visibleNavItems = navItems.filter((item) => !disabledSlugs.has(item.href));

  const siteTitle =
    lang === 'ar'
      ? sys?.siteNameAr || UI_LABELS.ar.siteTitle
      : sys?.siteNameEn || UI_LABELS.en.siteTitle;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      {sys?.maintenanceMode && (
        <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-slate-950 flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          <span>
            {lang === 'ar'
              ? 'الموقع في وضع الصيانة والتحديث الدوري لبعض البيانات الأكاديمية.'
              : 'Maintenance Notice: Scheduled academic record verification is currently in progress.'}
          </span>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src={sys?.logoUrl || '/logo.jpeg'}
            alt="Red Dragon Study Logo"
            className="h-12 w-12 rounded-full object-cover border border-brand-200 shadow-sm"
          />
          <div>
            <span className="block text-base sm:text-lg font-extrabold tracking-tight text-brand-800 group-hover:text-brand-700">
              {siteTitle}
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              {lang === 'ar' ? 'RED DRAGON STUDY • الدراسة في الصين' : 'CHINA UNIVERSITY ADMISSIONS'}
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {visibleNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.openInNewTab ? '_blank' : undefined}
              className="text-sm font-semibold text-slate-700 hover:text-brand-700 transition"
            >
              {lang === 'ar' ? item.labelAr || item.labelEn : item.labelEn}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher currentLang={lang} />
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-4 bg-slate-50/70">
        {visibleNavItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="whitespace-nowrap text-xs font-semibold text-slate-700 hover:text-brand-700"
          >
            {lang === 'ar' ? item.labelAr || item.labelEn : item.labelEn}
          </Link>
        ))}
      </div>
    </header>
  );
}
