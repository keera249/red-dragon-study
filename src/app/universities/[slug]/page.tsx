import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import { sanitizePublicUniversity } from '@/lib/public-data';
import { getLocalizedText, hasNonEmptyText } from '@/lib/visibility';
import { getAuthenticatedActor } from '@/lib/auth';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CompareToggleButton } from '@/components/CompareToggleButton';
import { GalleryViewerClient } from '@/components/GalleryViewerClient';
import { InquiryFormClient } from '@/components/InquiryFormClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getCurrentLocale();
  const uni = await prisma.university.findUnique({ where: { slug } });
  if (!uni || uni.status !== 'PUBLISHED') {
    return { title: 'University Not Found' };
  }
  const title =
    lang === 'ar'
      ? uni.seoTitleAr || `${uni.nameAr || uni.nameEn} | التنين الأحمر للدراسة`
      : uni.seoTitleEn || `${uni.nameEn} (${uni.nameZh || 'China'}) | Red Dragon Study`;
  const description =
    lang === 'ar'
      ? uni.seoDescriptionAr || uni.shortDescriptionAr || uni.shortDescriptionEn || ''
      : uni.seoDescriptionEn || uni.shortDescriptionEn || '';

  return {
    title,
    description,
    alternates: uni.canonicalUrl ? { canonical: uni.canonicalUrl } : undefined,
    robots: uni.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function UniversityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; lang?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const actor = sp?.preview === 'true' ? await getAuthenticatedActor() : null;
  const allowPreview = Boolean(actor);

  let rawUni = await prisma.university.findUnique({
    where: { slug },
    include: {
      programs: true,
      fees: true,
      scholarshipLinks: { include: { scholarship: true } },
      sharedRequirements: { include: { requirement: true, override: true } },
      specificRequirements: true,
      galleries: { include: { images: true } },
      deadlines: true,
    },
  });

  // Section 23: Support redirects when university slugs change
  if (!rawUni) {
    const slugRedirect = await prisma.universitySlugRedirect.findUnique({
      where: { oldSlug: slug },
      include: { university: { select: { slug: true, status: true } } },
    });
    if (slugRedirect && slugRedirect.university.status === 'PUBLISHED') {
      redirect(`/universities/${slugRedirect.university.slug}`);
    }
    notFound();
  }

  const [sys, contact, waTemplates] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.contactSetting.findUnique({ where: { id: 'default' } }),
    prisma.whatsAppTemplate.findMany({ where: { isEnabled: true } }),
  ]);

  const warningDays = sys?.deadlineWarningDays ?? 30;
  const uni = sanitizePublicUniversity(rawUni, warningDays, allowPreview);
  if (!uni) {
    notFound();
  }

  const uName = getLocalizedText(lang, uni.nameAr, uni.nameEn) || uni.nameEn;
  const shortDesc = getLocalizedText(lang, uni.shortDescriptionAr, uni.shortDescriptionEn);
  const detailedDesc = getLocalizedText(lang, uni.detailedDescriptionAr, uni.detailedDescriptionEn);
  const accreditation = getLocalizedText(lang, uni.accreditationInfoAr, uni.accreditationInfoEn);
  const recognition = getLocalizedText(lang, uni.recognitionInfoAr, uni.recognitionInfoEn);
  const ranking = getLocalizedText(lang, uni.rankingInfoAr, uni.rankingInfoEn);
  const accomDesc = getLocalizedText(lang, uni.accommodationDescAr, uni.accommodationDescEn);

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/universities/${uni.slug}`;

  // Structured data JSON-LD for SEO (Section 23)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: uni.nameEn,
    alternateName: uni.nameZh || undefined,
    description: uni.shortDescriptionEn || undefined,
    url: uni.officialWebsite || pageUrl,
    address: uni.city
      ? {
          '@type': 'PostalAddress',
          addressLocality: uni.city,
          addressRegion: uni.province || undefined,
          addressCountry: uni.country || 'CN',
        }
      : undefined,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* University Hero Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <img
                src={uni.logoUrl || '/logo.jpeg'}
                alt={uName}
                className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">{uName}</h1>
                  {hasNonEmptyText(uni.nameZh) && (
                    <span className="rounded-lg bg-brand-50 px-3 py-1 text-sm font-bold text-brand-800 border border-brand-200">
                      {uni.nameZh}
                    </span>
                  )}
                  {uni.verificationStatus === 'VERIFIED' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      {t.common.verifiedInfo}
                    </span>
                  )}
                </div>

                {(uni.city || uni.province || uni.universityType) && (
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                    {(uni.city || uni.province) && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-brand-700" />
                        {[uni.district, uni.city, uni.province, uni.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    )}
                    {hasNonEmptyText(uni.universityType) && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-brand-700" />
                        {uni.universityType}
                      </span>
                    )}
                  </div>
                )}

                {shortDesc && (
                  <p className="text-sm sm:text-base text-slate-700 max-w-3xl leading-relaxed pt-1">
                    {shortDesc}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0">
              {contact && (
                <WhatsAppButton
                  config={{
                    globalWhatsappEnabled: contact.globalWhatsappEnabled,
                    defaultWhatsappNumber: contact.defaultWhatsappNumber,
                    universityWhatsappNumber: uni.whatsappNumber,
                    defaultMessageEn: contact.defaultMessageEn,
                    defaultMessageAr: contact.defaultMessageAr,
                    buttonTextEn: contact.buttonTextEn,
                    buttonTextAr: contact.buttonTextAr,
                    templates: waTemplates,
                  }}
                  lang={lang}
                  universityId={uni.id}
                  variables={{
                    university_name: uName,
                    city: uni.city,
                    page_url: pageUrl,
                  }}
                />
              )}

              <CompareToggleButton slug={uni.slug} lang={lang} />

              {/* Rule 9: Missing official website URLs must not produce buttons */}
              {uni.officialWebsite && (
                <a
                  href={uni.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <span>{t.common.officialWebsite}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {uni.officialAdmissionsUrl && (
                <a
                  href={uni.officialAdmissionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <span>{t.common.officialAdmissions}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Optional Overview Details (Rule 14: Empty optional fields must not display labels) */}
          {(detailedDesc || accreditation || recognition || ranking) && (
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              {detailedDesc && (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {detailedDesc}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {accreditation && (
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                      {lang === 'ar' ? 'الاعتماد الأكاديمي' : 'Accreditation'}
                    </div>
                    <div className="text-xs font-medium text-slate-800">{accreditation}</div>
                  </div>
                )}
                {recognition && (
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                      {lang === 'ar' ? 'التصنيف والاعتراف' : 'Recognition'}
                    </div>
                    <div className="text-xs font-medium text-slate-800">{recognition}</div>
                  </div>
                )}
                {ranking && (
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                      {lang === 'ar' ? 'المرتبة الأكاديمية' : 'Academic Ranking'}
                    </div>
                    <div className="text-xs font-medium text-slate-800">{ranking}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Academic Programs Section (Hidden automatically if 0 published programs) */}
        {uni.programs.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-brand-700" />
              <h2 className="text-xl font-bold text-slate-900">{t.common.programs}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {uni.programs.map((prog: any) => {
                const pName = getLocalizedText(lang, prog.nameAr, prog.nameEn);
                const pDiscipline = getLocalizedText(lang, prog.disciplineAr, prog.disciplineEn);
                const pDuration = getLocalizedText(lang, prog.durationAr, prog.durationEn);
                const pElig = getLocalizedText(lang, prog.eligibilityAr, prog.eligibilityEn);
                const pLangReq = getLocalizedText(lang, prog.languageReqAr, prog.languageReqEn);

                return (
                  <div
                    key={prog.id}
                    className="rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-brand-300 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800">
                          {t.degrees[prog.degreeLevel] || prog.degreeLevel}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {t.languages[prog.languageOfInstruction] || prog.languageOfInstruction}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">{pName}</h3>
                        {prog.nameZh && (
                          <span className="text-xs text-slate-500 block">{prog.nameZh}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        {pDiscipline && (
                          <div>
                            <span className="text-slate-400 block">
                              {lang === 'ar' ? 'التخصص:' : 'Discipline:'}
                            </span>
                            <strong className="text-slate-800">{pDiscipline}</strong>
                          </div>
                        )}
                        {pDuration && (
                          <div>
                            <span className="text-slate-400 block">
                              {lang === 'ar' ? 'مدة الدراسة:' : 'Duration:'}
                            </span>
                            <strong className="text-slate-800">{pDuration}</strong>
                          </div>
                        )}
                        {typeof prog.tuitionAmount === 'number' && (
                          <div>
                            <span className="text-slate-400 block">
                              {lang === 'ar' ? 'الرسوم الدراسية:' : 'Tuition Fee:'}
                            </span>
                            <strong className="text-brand-700">
                              {prog.tuitionAmount.toLocaleString()} {prog.tuitionCurrency} /{' '}
                              {t.periods[prog.tuitionPeriod] || prog.tuitionPeriod}
                            </strong>
                          </div>
                        )}
                        {prog.deadlineInfo?.shouldDisplayPublicly && (
                          <div>
                            <span className="text-slate-400 block">
                              {lang === 'ar' ? 'حالة التقديم:' : 'Deadline:'}
                            </span>
                            <strong className="text-slate-800">
                              {prog.deadlineInfo.formattedClosingDate ||
                                (lang === 'ar'
                                  ? prog.deadlineInfo.labelAr
                                  : prog.deadlineInfo.labelEn)}
                            </strong>
                          </div>
                        )}
                      </div>

                      {pElig && <p className="text-xs text-slate-600 pt-1">{pElig}</p>}
                      {pLangReq && (
                        <p className="text-xs font-medium text-slate-700">
                          {lang === 'ar' ? 'شرط اللغة:' : 'Language Req:'} {pLangReq}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/universities/${uni.slug}/programs/${prog.slug}`}
                        className="text-xs font-bold text-brand-700 hover:underline"
                      >
                        {t.common.viewDetails} →
                      </Link>
                      {contact && (
                        <WhatsAppButton
                          config={{
                            globalWhatsappEnabled: contact.globalWhatsappEnabled,
                            defaultWhatsappNumber: contact.defaultWhatsappNumber,
                            universityWhatsappNumber: uni.whatsappNumber,
                            defaultMessageEn: contact.defaultMessageEn,
                            defaultMessageAr: contact.defaultMessageAr,
                            buttonTextEn: contact.buttonTextEn,
                            buttonTextAr: contact.buttonTextAr,
                            templates: waTemplates,
                          }}
                          lang={lang}
                          universityId={uni.id}
                          programId={prog.id}
                          variables={{
                            university_name: uName,
                            major_name: pName,
                            city: uni.city,
                            application_deadline: prog.deadlineInfo?.formattedClosingDate,
                            page_url: `${pageUrl}/programs/${prog.slug}`,
                          }}
                          variant="compact"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Fees & Expenses Section (Hidden automatically if 0 published fees) */}
        {uni.fees.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="h-5 w-5 text-brand-700" />
              <h2 className="text-xl font-bold text-slate-900">{t.common.feesAndExpenses}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 bg-slate-50">
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الفئة' : 'Category'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'البيان' : 'Description'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المبلغ والعملة' : 'Amount'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الفترة' : 'Period'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'العام الدراسي' : 'Academic Year'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'حالة التوثيق' : 'Verification'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uni.fees.map((fee: any) => (
                    <tr key={fee.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-800 text-xs">
                        {t.feeCategories[fee.category] || fee.category}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {getLocalizedText(lang, fee.titleAr, fee.titleEn)}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-700">
                        {Number(fee.amount).toLocaleString()} {fee.currency}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {t.periods[fee.period] || fee.period}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {fee.academicYear || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            fee.isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {fee.isConfirmed ? t.common.confirmedFee : t.common.estimatedFee}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Admission Requirements Checklist (Rule 13 & 8.4: Hidden if 0 visible requirements) */}
        {uni.requirements.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <FileCheck2 className="h-5 w-5 text-brand-700" />
              <h2 className="text-xl font-bold text-slate-900">{t.common.requirements}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uni.requirements.map((req: any) => {
                const rName = getLocalizedText(lang, req.nameAr, req.nameEn);
                const rDesc = getLocalizedText(lang, req.descriptionAr, req.descriptionEn);
                const rInst = getLocalizedText(lang, req.instructionsAr, req.instructionsEn);

                return (
                  <div
                    key={req.id}
                    className="rounded-xl border border-slate-200 p-4 flex items-start gap-3 bg-slate-50/40"
                  >
                    <CheckCircle2
                      className={`h-5 w-5 shrink-0 mt-0.5 ${
                        req.isRequired ? 'text-brand-700' : 'text-slate-400'
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{rName}</h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            req.isRequired
                              ? 'bg-brand-100 text-brand-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {req.isRequired ? t.common.requiredDoc : t.common.optionalDoc}
                        </span>
                      </div>
                      {rDesc && <p className="text-xs text-slate-600">{rDesc}</p>}
                      {rInst && (
                        <p className="text-xs font-medium text-brand-800 bg-brand-50/60 px-2.5 py-1.5 rounded-lg">
                          {rInst}
                        </p>
                      )}
                      {req.supportingDocUrl && (
                        <a
                          href={req.supportingDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline pt-1"
                        >
                          <span>{lang === 'ar' ? 'تحميل النموذج المرفق' : 'Download Form'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Scholarships Section (Rule 8: Hidden if no applicable published scholarships) */}
        {uni.scholarships.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-brand-700" />
              <h2 className="text-xl font-bold text-slate-900">{t.common.scholarships}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {uni.scholarships.map((sch: any) => {
                const sName = getLocalizedText(lang, sch.nameAr, sch.nameEn);
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
                    className="rounded-xl border border-slate-200 p-5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-bold text-amber-900">
                        {t.funding[sch.fundingType] || sch.fundingType}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{sName}</h3>
                      {sTuition && <p className="text-xs text-slate-600">• {sTuition}</p>}
                      {sAccom && <p className="text-xs text-slate-600">• {sAccom}</p>}
                      {typeof sch.stipendAmount === 'number' && (
                        <p className="text-xs font-semibold text-emerald-700">
                          • {lang === 'ar' ? 'راتب شهري:' : 'Stipend:'} {sch.stipendAmount}{' '}
                          {sch.stipendCurrency}/{sch.stipendPeriod}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/scholarships/${sch.slug}`}
                        className="text-xs font-bold text-brand-700 hover:underline"
                      >
                        {t.common.viewDetails} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Campus & Facilities Photo Galleries (Rule 6: Disappears completely if empty!) */}
        {uni.campusGalleries.length > 0 && (
          <GalleryViewerClient
            galleries={uni.campusGalleries}
            lang={lang}
            sectionTitle={t.common.campusGallery}
          />
        )}

        {/* Student Accommodation Gallery (Rule 7: Disappears completely if empty!) */}
        {uni.accommodationGalleries.length > 0 && (
          <GalleryViewerClient
            galleries={uni.accommodationGalleries}
            lang={lang}
            sectionTitle={t.common.accommodationGallery}
          />
        )}

        {/* Deadlines Section (Rule 11: Hidden if no visible deadlines) */}
        {uni.deadlines.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5 w-5 text-brand-700" />
              <h2 className="text-xl font-bold text-slate-900">{t.common.deadlines}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {uni.deadlines.map((dl: any) => (
                <div key={dl.id} className="rounded-xl border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                      {lang === 'ar' ? dl.evaluated.labelAr : dl.evaluated.labelEn}
                    </span>
                    <span className="text-xs text-slate-500">{dl.academicYear}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {getLocalizedText(lang, dl.titleAr, dl.titleEn)}
                  </h3>
                  {dl.evaluated.formattedClosingDate && (
                    <p className="text-xs text-slate-600">
                      {lang === 'ar' ? 'تاريخ الإغلاق:' : 'Closing:'}{' '}
                      <strong>{dl.evaluated.formattedClosingDate}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Geographic Location & Map Section (Rule 10 & Section 6: Hidden if no valid location) */}
        {uni.mapInfo.canShowMapSection && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-700" />
                <h2 className="text-xl font-bold text-slate-900">{t.common.locationAndMap}</h2>
              </div>
              {uni.mapInfo.hasDirectMapUrl && (
                <a
                  href={uni.mapUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-slate-50"
                >
                  <span>{lang === 'ar' ? 'فتح الموقع على الخريطة' : 'Open Direct Map URL'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {uni.mapInfo.hasAddress && (
              <p className="text-sm text-slate-600">{uni.address}</p>
            )}

            {uni.mapInfo.hasCoordinates && (
              <div className="overflow-hidden rounded-xl border border-slate-200 h-72">
                <iframe
                  title={`${uName} Map`}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    uni.longitude! - 0.02
                  }%2C${uni.latitude! - 0.02}%2C${uni.longitude! + 0.02}%2C${
                    uni.latitude! + 0.02
                  }&layer=mapnik&marker=${uni.latitude}%2C${uni.longitude}`}
                />
              </div>
            )}
          </section>
        )}

        {/* Direct University Inquiry Section */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            {lang === 'ar'
              ? `استفسر الآن عن القبول في ${uName}`
              : `Inquire About Admission to ${uName}`}
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {lang === 'ar'
              ? 'أرسل بياناتك وسيقوم مستشار القبول المختص بتزويدك بخطوات التقديم التفصيلية.'
              : 'Submit your details below and our admissions advisor will guide you through the application process.'}
          </p>
          <InquiryFormClient
            lang={lang}
            universities={[{ id: uni.id, nameEn: uni.nameEn, nameAr: uni.nameAr }]}
            scholarships={uni.scholarships.map((s: any) => ({
              id: s.id,
              nameEn: s.nameEn,
              nameAr: s.nameAr,
            }))}
            defaultUniversityId={uni.id}
            privacyNotice={
              getLocalizedText(lang, sys?.privacyNoticeAr, sys?.privacyNoticeEn) || undefined
            }
          />
        </section>
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
