import React from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import {
  getLocalizedText,
  isRecordPubliclyVisible,
  shouldRenderSectionWithChildren,
} from '@/lib/visibility';
import { evaluateDeadline } from '@/lib/deadlines';
import { sanitizePublicUniversity } from '@/lib/public-data';
import { getAuthenticatedActor } from '@/lib/auth';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CompareToggleButton } from '@/components/CompareToggleButton';
import { InquiryFormClient } from '@/components/InquiryFormClient';
import { OfficialDownloadsSection } from '@/components/OfficialDownloadsSection';
import { OfficialPricingSection } from '@/components/OfficialPricingSection';
import { OfficialServicesSection } from '@/components/OfficialServicesSection';
import { OfficialTestimonialsGallery } from '@/components/OfficialTestimonialsGallery';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const actor = sp?.preview === 'true' ? await getAuthenticatedActor() : null;
  const allowPreview = Boolean(actor);

  const [
    sys,
    contact,
    sections,
    rawUniversities,
    rawScholarships,
    rawDeadlines,
    rawFaqs,
    waTemplates,
  ] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.contactSetting.findUnique({ where: { id: 'default' } }),
    prisma.homepageSection.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.university.findMany({
      where: allowPreview ? { status: { not: 'DELETED' } } : { status: 'PUBLISHED' },
      include: {
        programs: { where: { status: 'PUBLISHED' } },
        fees: { where: { status: 'PUBLISHED' } },
        scholarshipLinks: { include: { scholarship: true } },
        sharedRequirements: { include: { requirement: true, override: true } },
        specificRequirements: { where: { status: 'PUBLISHED', isEnabled: true } },
        galleries: { include: { images: true } },
        deadlines: { where: { status: 'PUBLISHED' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.scholarship.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        universityLinks: { include: { university: { select: { nameEn: true, nameAr: true, slug: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.applicationDeadline.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        university: { select: { nameEn: true, nameAr: true, slug: true, status: true } },
      },
      orderBy: { closingDate: 'asc' },
    }),
    prisma.faqItem.findMany({
      where: { isEnabled: true, status: 'PUBLISHED' },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.whatsAppTemplate.findMany({ where: { isEnabled: true } }),
  ]);

  const warningDays = sys?.deadlineWarningDays ?? 30;
  const visibleUniversities = rawUniversities
    .map((u) => sanitizePublicUniversity(u, warningDays, allowPreview))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const featuredUniversities = visibleUniversities.filter((u) => u.isFeatured);
  const displayUniversities =
    featuredUniversities.length > 0 ? featuredUniversities : visibleUniversities.slice(0, 6);

  const visibleDeadlines = rawDeadlines
    .filter((d) => !d.university || d.university.status === 'PUBLISHED')
    .map((d) => ({
      ...d,
      evaluated: evaluateDeadline(d, { warningDays, locale: lang }),
    }))
    .filter(
      (d) =>
        d.evaluated.shouldDisplayPublicly &&
        (d.evaluated.status === 'OPEN' || d.evaluated.status === 'DEADLINE_APPROACHING')
    );

  const visibleSections = sections.filter((sec) => isRecordPubliclyVisible(sec, allowPreview));

  const renderSection = (key: string) => {
    const section = visibleSections.find((s) => s.sectionKey === key);
    if (!section) return null;

    const title = getLocalizedText(lang, section.titleAr, section.titleEn);
    const subtitle = getLocalizedText(lang, section.subtitleAr, section.subtitleEn);
    const desc = getLocalizedText(lang, section.descriptionAr, section.descriptionEn);
    const btnText = getLocalizedText(lang, section.buttonTextAr, section.buttonTextEn);
    const secBtnText = getLocalizedText(
      lang,
      section.secondaryButtonTextAr,
      section.secondaryButtonTextEn
    );

    // 1. HERO SECTION
    if (key === 'hero') {
      if (!title) return null;
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-slate-950 text-white py-16 sm:py-24"
        >
          {/* Subtle background ambient glow */}
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                {subtitle && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{subtitle}</span>
                  </div>
                )}
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  {title}
                </h1>
                {desc && (
                  <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
                    {desc}
                  </p>
                )}

                {/* Quick Search Bar */}
                <form
                  action="/universities"
                  method="GET"
                  className="flex flex-col sm:flex-row gap-2 max-w-xl bg-white/10 p-2 rounded-2xl backdrop-blur border border-white/15"
                >
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute top-3.5 start-3.5" />
                    <input
                      type="text"
                      name="q"
                      placeholder={t.common.searchPlaceholder}
                      className="w-full rounded-xl bg-white ps-10 pe-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-500 transition shadow"
                  >
                    {t.common.searchBtn}
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#downloads"
                    className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-brand-950 shadow hover:bg-amber-300 transition"
                  >
                    {lang === 'ar' ? 'تحميل الاستمارات الرسمية ↓' : 'Download Forms ↓'}
                  </a>
                  <a
                    href="#pricing"
                    className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition"
                  >
                    {lang === 'ar' ? 'باقات التقديم والأسعار' : 'Pricing Packages'}
                  </a>
                  <Link
                    href="/universities"
                    className="rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-white/10 transition"
                  >
                    {t.nav.universities}
                  </Link>
                  {contact && (
                    <WhatsAppButton
                      config={{
                        globalWhatsappEnabled: contact.globalWhatsappEnabled,
                        defaultWhatsappNumber: contact.defaultWhatsappNumber,
                        defaultMessageEn: contact.defaultMessageEn,
                        defaultMessageAr: contact.defaultMessageAr,
                        buttonTextEn: contact.buttonTextEn,
                        buttonTextAr: contact.buttonTextAr,
                        templates: waTemplates,
                      }}
                      lang={lang}
                    />
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="relative rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md shadow-2xl max-w-sm w-full text-center space-y-4">
                  <img
                    src={section.imageUrl || sys?.logoUrl || '/logo.jpeg'}
                    alt="Red Dragon Study"
                    className="mx-auto h-36 w-36 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  />
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-white">RED DRAGON STUDY</h2>
                    <p className="text-xs text-amber-300 font-semibold">
                      {lang === 'ar'
                        ? 'قبول جامعي رسمي • منح دراسية • إشراف متكامل'
                        : 'Official Admissions • Scholarships • Academic Advisory'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                    <div>
                      <div className="text-xl font-black text-white">560+</div>
                      <div className="text-[11px] text-slate-300 font-medium">
                        {lang === 'ar' ? 'قبول محقق' : 'Admissions'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">300+</div>
                      <div className="text-[11px] text-slate-300 font-medium">
                        {lang === 'ar' ? 'جامعة معتمدة' : 'Universities'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-amber-300">100%</div>
                      <div className="text-[11px] text-slate-300 font-medium">
                        {lang === 'ar' ? 'متابعة مباشرة' : 'Direct Support'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // 2. FEATURED UNIVERSITIES SECTION (Rule 15: hide if 0 visible universities)
    if (key === 'featured_universities') {
      if (
        !shouldRenderSectionWithChildren(
          section.isEnabled,
          section.status,
          displayUniversities,
          allowPreview
        )
      ) {
        return null;
      }

      return (
        <section key={section.id} className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              {title && <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>}
              {desc && <p className="mt-2 text-sm text-slate-600">{desc}</p>}
            </div>
            <Link
              href="/universities"
              className="inline-flex items-center text-sm font-bold text-brand-700 hover:text-brand-800"
            >
              {lang === 'ar' ? 'عرض جميع الجامعات ←' : 'View All Universities →'}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayUniversities.map((uni) => {
              const uName = getLocalizedText(lang, uni.nameAr, uni.nameEn);
              const uDesc = getLocalizedText(
                lang,
                uni.shortDescriptionAr,
                uni.shortDescriptionEn
              );

              return (
                <div
                  key={uni.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={uni.logoUrl || '/logo.jpeg'}
                        alt={uName || uni.nameEn}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{uName}</h3>
                        {uni.nameZh && (
                          <span className="text-xs font-medium text-brand-700 block">
                            {uni.nameZh}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(uni.city || uni.province) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <MapPin className="h-3.5 w-3.5 text-brand-700" />
                      <span>{[uni.city, uni.province].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  {uDesc && (
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{uDesc}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-5 text-xs">
                    {uni.programs.length > 0 && (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                        {uni.programs.length}{' '}
                        {lang === 'ar' ? 'برامج متاحة' : 'Programs'}
                      </span>
                    )}
                    {uni.scholarships.length > 0 && (
                      <span className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 font-medium text-amber-800">
                        {uni.scholarships.length}{' '}
                        {lang === 'ar' ? 'منح دراسية' : 'Scholarships'}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/universities/${uni.slug}`}
                      className="rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800 transition"
                    >
                      {t.common.viewDetails}
                    </Link>
                    <CompareToggleButton slug={uni.slug} lang={lang} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    // 3. AVAILABLE SCHOLARSHIPS SECTION (Rule 8: Hide if no published scholarships)
    if (key === 'available_scholarships') {
      if (
        !shouldRenderSectionWithChildren(
          section.isEnabled,
          section.status,
          rawScholarships,
          allowPreview
        )
      ) {
        return null;
      }

      return (
        <section key={section.id} className="bg-slate-100/80 py-16 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                {title && <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>}
                {desc && <p className="mt-2 text-sm text-slate-600">{desc}</p>}
              </div>
              <Link
                href="/scholarships"
                className="inline-flex items-center text-sm font-bold text-brand-700 hover:text-brand-800"
              >
                {lang === 'ar' ? 'عرض جميع المنح الدراسية ←' : 'Explore All Scholarships →'}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rawScholarships.slice(0, 4).map((sch) => {
                const sName = getLocalizedText(lang, sch.nameAr, sch.nameEn);
                const sProvider = getLocalizedText(lang, sch.providerAr, sch.providerEn);
                const sTuition = getLocalizedText(
                  lang,
                  sch.tuitionCoverageAr,
                  sch.tuitionCoverageEn
                );
                const sAccom = getLocalizedText(
                  lang,
                  sch.accommodationCoverageAr,
                  sch.accommodationCoverageEn
                );

                return (
                  <div
                    key={sch.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200">
                          <Award className="h-3.5 w-3.5" />
                          {t.funding[sch.fundingType] || sch.fundingType}
                        </span>
                        {sProvider && (
                          <span className="text-xs font-medium text-slate-500">
                            {sProvider}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">{sName}</h3>
                      <ul className="space-y-1.5 text-xs text-slate-700 mb-4">
                        {sTuition && (
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>{sTuition}</span>
                          </li>
                        )}
                        {sAccom && (
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>{sAccom}</span>
                          </li>
                        )}
                        {typeof sch.stipendAmount === 'number' && (
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>
                              {lang === 'ar' ? 'راتب شهري:' : 'Stipend:'} {sch.stipendAmount}{' '}
                              {sch.stipendCurrency}/{sch.stipendPeriod}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/scholarships/${sch.slug}`}
                        className="text-xs font-bold text-brand-700 hover:underline"
                      >
                        {t.common.viewDetails}
                      </Link>
                      {sch.universityLinks.length > 0 && (
                        <span className="text-xs text-slate-500">
                          {sch.universityLinks.length}{' '}
                          {lang === 'ar' ? 'جامعات مرتبطة' : 'Partner Universities'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    // 4. UPCOMING DEADLINES SECTION
    if (key === 'upcoming_deadlines') {
      if (
        !shouldRenderSectionWithChildren(
          section.isEnabled,
          section.status,
          visibleDeadlines,
          allowPreview
        )
      ) {
        return null;
      }

      return (
        <section key={section.id} className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            {title && <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>}
            {desc && <p className="mt-2 text-sm text-slate-600">{desc}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {visibleDeadlines.map((dl) => {
              const dlTitle = getLocalizedText(lang, dl.titleAr, dl.titleEn);
              const isApproaching = dl.evaluated.status === 'DEADLINE_APPROACHING';
              return (
                <div
                  key={dl.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isApproaching
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {lang === 'ar' ? dl.evaluated.labelAr : dl.evaluated.labelEn}
                      </span>
                      {dl.evaluated.daysRemaining !== null && (
                        <span className="text-xs font-semibold text-slate-500">
                          {dl.evaluated.daysRemaining}{' '}
                          {lang === 'ar' ? 'يوماً متبقياً' : 'days left'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-2">{dlTitle}</h3>
                    {dl.evaluated.formattedClosingDate && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-brand-700" />
                        <span>
                          {lang === 'ar' ? 'تاريخ الإغلاق:' : 'Closing Date:'}{' '}
                          <strong>{dl.evaluated.formattedClosingDate}</strong>
                        </span>
                      </p>
                    )}
                  </div>
                  {dl.university && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <Link
                        href={`/universities/${dl.university.slug}`}
                        className="text-xs font-semibold text-brand-700 hover:underline"
                      >
                        {getLocalizedText(lang, dl.university.nameAr, dl.university.nameEn)} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    // 5. APPLICATION PROCESS SECTION
    if (key === 'application_process') {
      const steps = [
        {
          step: '01',
          titleEn: 'Academic Consultation & Program Selection',
          titleAr: 'الاستشارة الأكاديمية واختيار الجامعة والتخصص',
          descEn: 'Compare accredited Chinese universities, tuition fees, and scholarship eligibility.',
          descAr: 'مقارنة الجامعات الصينية المعتمدة والرسوم الدراسية وشروط الأهلية للمنح.',
        },
        {
          step: '02',
          titleEn: 'Document Checklist & Verification',
          titleAr: 'تجهيز وتدقيق ملف المستندات المطلوبة',
          descEn: 'Prepare transcripts, passport, study plan, medical form, and language certificates.',
          descAr: 'تجهيز كشف الدرجات وجواز السفر والخطة الدراسية والفحص الطبي وشهادات اللغة.',
        },
        {
          step: '03',
          titleEn: 'Official University & Scholarship Submission',
          titleAr: 'التقديم الرسمي للجامعة والمنحة الدراسية',
          descEn: 'Submit applications prior to official deadlines and track review stages.',
          descAr: 'تقديم الطلبات قبل المواعيد النهائية الرسمية ومتابعة مراحل التقييم والمقابلات.',
        },
        {
          step: '04',
          titleEn: 'Admission Notice, JW202 & Visa Preparation',
          titleAr: 'استلام خطاب القبول ونموذج JW202 وتأشيرة السفر',
          descEn: 'Receive official admission documents and prepare for X1/X2 student visa and arrival.',
          descAr: 'استلام وثائق القبول الرسمية والاستعداد لاستخراج تأشيرة الدراسة والسفر للصين.',
        },
      ];

      return (
        <section key={section.id} className="bg-slate-900 text-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              {title && <h2 className="text-2xl sm:text-3xl font-extrabold">{title}</h2>}
              {desc && <p className="mt-2 text-sm text-slate-300">{desc}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((st) => (
                <div
                  key={st.step}
                  className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-3"
                >
                  <span className="inline-block rounded-lg bg-brand-700 px-3 py-1 text-xs font-black text-white">
                    {st.step}
                  </span>
                  <h3 className="font-bold text-base text-white">
                    {lang === 'ar' ? st.titleAr : st.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'ar' ? st.descAr : st.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // 6. FAQ SECTION
    if (key === 'faq_section') {
      if (
        !shouldRenderSectionWithChildren(
          section.isEnabled,
          section.status,
          rawFaqs,
          allowPreview
        )
      ) {
        return null;
      }

      return (
        <section key={section.id} className="py-16 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            {title && <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>}
            {desc && <p className="mt-2 text-sm text-slate-600">{desc}</p>}
          </div>
          <div className="space-y-4">
            {rawFaqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {getLocalizedText(lang, faq.questionAr, faq.questionEn)}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {getLocalizedText(lang, faq.answerAr, faq.answerEn)}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    // 7. STUDENT INQUIRY FORM SECTION
    if (key === 'inquiry_section') {
      return (
        <section
          key={section.id}
          id="inquiry"
          className="bg-slate-100 py-16 border-t border-slate-200"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
              <div className="mb-6">
                {title && (
                  <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
                )}
                {desc && <p className="mt-1 text-sm text-slate-600">{desc}</p>}
              </div>
              <InquiryFormClient
                lang={lang}
                universities={visibleUniversities.map((u) => ({
                  id: u.id,
                  nameEn: u.nameEn,
                  nameAr: u.nameAr,
                }))}
                scholarships={rawScholarships.map((s) => ({
                  id: s.id,
                  nameEn: s.nameEn,
                  nameAr: s.nameAr,
                }))}
                privacyNotice={
                  getLocalizedText(lang, sys?.privacyNoticeAr, sys?.privacyNoticeEn) ||
                  undefined
                }
              />
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  const renderedKeys = new Set([
    'hero',
    'featured_universities',
    'available_scholarships',
    'application_process',
    'upcoming_deadlines',
    'faq_section',
    'inquiry_section',
  ]);
  const otherSections = visibleSections.filter((s) => !renderedKeys.has(s.sectionKey));

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      {allowPreview && (
        <div className="bg-indigo-900 px-4 py-2 text-center text-xs font-semibold text-white">
          {lang === 'ar'
            ? 'وضع المعاينة الإدارية نشط: يمكنك مشاهدة المسودات والتعديلات قبل النشر.'
            : 'Admin Preview Mode Active: Viewing draft homepage sections before publication.'}
        </div>
      )}

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        {renderSection('hero')}

        {/* 2. OFFICIAL SERVICES (خدمات التنين الأحمر الـ 8 المتكاملة) */}
        <OfficialServicesSection lang={lang} />

        {/* 3. OFFICIAL PRICING PACKAGES (باقات التقديم الشفافة) */}
        <OfficialPricingSection lang={lang} />

        {/* 4. OFFICIAL DOWNLOADS & CHECKLISTS (تحميل الاستمارات والفحص الطبي) */}
        <OfficialDownloadsSection lang={lang} />

        {/* 5. FEATURED UNIVERSITIES (الجامعات الصينية الموصى بها) */}
        {renderSection('featured_universities')}

        {/* 6. AVAILABLE SCHOLARSHIPS (المنح الدراسية وفرص التمويل) */}
        {renderSection('available_scholarships')}

        {/* 7. REAL STUDENT ADMISSIONS (قبولات وإشعارات طلابنا الحقيقية) */}
        <OfficialTestimonialsGallery lang={lang} />

        {/* 8. APPLICATION PROCESS (مراحل التقديم الأربعة) */}
        {renderSection('application_process')}

        {/* 9. UPCOMING DEADLINES (مواعيد التقديم النشطة) */}
        {renderSection('upcoming_deadlines')}

        {/* 10. FAQ SECTION (الأسئلة الشائعة) */}
        {renderSection('faq_section')}

        {/* 11. INQUIRY FORM (طلب تقديم واستشارة أكاديمية) */}
        {renderSection('inquiry_section')}

        {/* Custom DB Sections */}
        {otherSections.map((sec) => renderSection(sec.sectionKey))}
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
