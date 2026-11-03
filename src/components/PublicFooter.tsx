import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { SupportedLocale, UI_LABELS } from '@/lib/i18n';
import { hasNonEmptyText, getLocalizedText } from '@/lib/visibility';
import { WhatsAppButton } from './WhatsAppButton';

export async function PublicFooter({ lang }: { lang: SupportedLocale }) {
  const [sys, contact, footerNav, templates, pages] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.contactSetting.findUnique({ where: { id: 'default' } }),
    prisma.navigationItem.findMany({
      where: { location: 'FOOTER', isEnabled: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.whatsAppTemplate.findMany({ where: { isEnabled: true } }),
    prisma.websitePage.findMany({
      select: { slug: true, isEnabled: true, status: true, isSystemPage: true, titleEn: true, titleAr: true },
    }),
  ]);

  const disabledSlugs = new Set(
    pages.filter((p) => !p.isEnabled || p.status !== 'PUBLISHED').map((p) => `/${p.slug}`)
  );

  const visibleFooterNav = footerNav.filter((item) => !disabledSlugs.has(item.href));
  const customPublishedPages = pages.filter(
    (p) => !p.isSystemPage && p.isEnabled && p.status === 'PUBLISHED'
  );

  const siteTitle =
    lang === 'ar'
      ? sys?.siteNameAr || UI_LABELS.ar.siteTitle
      : sys?.siteNameEn || UI_LABELS.en.siteTitle;

  const address = getLocalizedText(lang, contact?.addressAr, contact?.addressEn);
  const workingHours = getLocalizedText(lang, contact?.workingHoursAr, contact?.workingHoursEn);

  let socialLinks: { instagram?: string; tiktok?: string; facebook?: string } = {};
  if (contact?.socialLinksJson) {
    try {
      socialLinks = JSON.parse(contact.socialLinksJson);
    } catch {}
  }

  const showFloatingWhatsApp =
    contact?.globalWhatsappEnabled !== false &&
    (contact?.buttonPlacement === 'FLOATING' || contact?.buttonPlacement === 'BOTH');

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={sys?.logoUrl || '/logo.jpeg'}
                alt="Red Dragon Study Logo"
                className="h-12 w-12 rounded-full object-cover border border-brand-400 bg-white p-0.5"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{siteTitle}</h3>
                <p className="text-xs text-brand-300">RED DRAGON STUDY CONSULTANCY</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {UI_LABELS[lang].tagline}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/requirements" className="font-bold text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5">
                  <span>{lang === 'ar' ? 'استمارات ومتطلبات التقديم ↓' : 'Requirements & Forms ↓'}</span>
                </Link>
              </li>
              <li>
                <Link href="/universities" className="hover:text-white transition">
                  {UI_LABELS[lang].nav.universities}
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-white transition">
                  {UI_LABELS[lang].nav.scholarships}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white transition">
                  {lang === 'ar' ? 'باقات التقديم والأسعار' : 'Pricing Packages'}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-white transition">
                  {lang === 'ar' ? 'خدمات التنين الأحمر الـ 8' : 'Our 8 Integrated Services'}
                </Link>
              </li>
              {/* <li>
                <Link href="/#testimonials" className="hover:text-white transition">
                  {lang === 'ar' ? 'قبولات وتجارب الطلاب' : 'Student Admissions'}
                </Link>
              </li> */}
              <li>
                <Link href="/compare" className="hover:text-white transition">
                  {UI_LABELS[lang].nav.compare}
                </Link>
              </li>
              {visibleFooterNav.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="hover:text-white transition">
                    {lang === 'ar' ? item.labelAr || item.labelEn : item.labelEn}
                  </Link>
                </li>
              ))}
              {customPublishedPages.map((cp) => (
                <li key={cp.slug}>
                  <Link href={`/p/${cp.slug}`} className="hover:text-white transition">
                    {lang === 'ar' ? cp.titleAr || cp.titleEn : cp.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {hasNonEmptyText(contact?.contactEmail) && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-400 shrink-0" />
                  <span>{contact!.contactEmail}</span>
                </li>
              )}
              {hasNonEmptyText(contact?.phoneDisplay) && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand-400 shrink-0" />
                  <span dir="ltr">{contact!.phoneDisplay}</span>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </li>
              )}
              {workingHours && (
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-400 shrink-0" />
                  <span>{workingHours}</span>
                </li>
              )}
            </ul>

            {/* Social Media Links */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'ar' ? 'تابعنا على المنصات' : 'Follow Our Channels'}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-pink-950/60 border border-pink-700/40 px-2.5 py-1 text-xs font-semibold text-pink-300 hover:bg-pink-900/60 transition"
                  >
                    <span>Instagram</span>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                  >
                    <span>TikTok</span>
                  </a>
                )}
                {contact?.defaultWhatsappNumber && (
                  <a
                    href={`https://wa.me/${contact.defaultWhatsappNumber.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition"
                  >
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} {siteTitle}.{' '}
            {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <p>
            {lang === 'ar'
              ? 'جميع المواعيد النهائية محسوبة بتوقيت بكين القياسي (Asia/Shanghai)'
              : 'All application deadlines are calculated in China Standard Time (Asia/Shanghai)'}
          </p>
        </div>
      </div>

      {showFloatingWhatsApp && contact && (
        <WhatsAppButton
          config={{
            globalWhatsappEnabled: contact.globalWhatsappEnabled,
            defaultWhatsappNumber: contact.defaultWhatsappNumber,
            defaultMessageEn: contact.defaultMessageEn,
            defaultMessageAr: contact.defaultMessageAr,
            buttonTextEn: contact.buttonTextEn,
            buttonTextAr: contact.buttonTextAr,
            templates,
          }}
          lang={lang}
          variant="floating"
        />
      )}
    </footer>
  );
}
