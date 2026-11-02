import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Award, Calendar, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import { getLocalizedText, isRecordPubliclyVisible, isValidPublicUrl } from '@/lib/visibility';
import { evaluateDeadline } from '@/lib/deadlines';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { InquiryFormClient } from '@/components/InquiryFormClient';

export default async function ScholarshipDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const sch = await prisma.scholarship.findUnique({
    where: { slug },
    include: {
      universityLinks: {
        include: {
          university: true,
        },
      },
    },
  });

  if (!sch || !isRecordPubliclyVisible(sch)) {
    notFound();
  }

  const [sys, contact, waTemplates] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.contactSetting.findUnique({ where: { id: 'default' } }),
    prisma.whatsAppTemplate.findMany({ where: { isEnabled: true } }),
  ]);

  const deadlineInfo = evaluateDeadline(
    {
      openingDate: sch.openingDate,
      closingDate: sch.deadlineDate,
      status: sch.status,
    },
    { warningDays: sys?.deadlineWarningDays ?? 30, locale: lang }
  );

  const publishedUniversities = sch.universityLinks
    .map((l) => l.university)
    .filter((u) => u && isRecordPubliclyVisible(u));

  const sName = getLocalizedText(lang, sch.nameAr, sch.nameEn) || sch.nameEn;
  const sProvider = getLocalizedText(lang, sch.providerAr, sch.providerEn);
  const sTuition = getLocalizedText(lang, sch.tuitionCoverageAr, sch.tuitionCoverageEn);
  const sAccom = getLocalizedText(lang, sch.accommodationCoverageAr, sch.accommodationCoverageEn);
  const sOther = getLocalizedText(lang, sch.otherBenefitsAr, sch.otherBenefitsEn);
  const sElig = getLocalizedText(lang, sch.eligibilityAr, sch.eligibilityEn);
  const sLangReq = getLocalizedText(lang, sch.languageRequirementsAr, sch.languageRequirementsEn);
  const sDocs = getLocalizedText(lang, sch.requiredDocumentsAr, sch.requiredDocumentsEn);
  const sDuration = getLocalizedText(lang, sch.durationAr, sch.durationEn);
  const sRenewal = getLocalizedText(lang, sch.renewalConditionsAr, sch.renewalConditionsEn);
  const sInstructions = getLocalizedText(
    lang,
    sch.applicationInstructionsAr,
    sch.applicationInstructionsEn
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200">
                  <Award className="h-3.5 w-3.5" />
                  {t.funding[sch.fundingType] || sch.fundingType}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{sName}</h1>
              {sProvider && <p className="text-sm font-medium text-slate-600">{sProvider}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                  scholarshipId={sch.id}
                  variables={{
                    scholarship_name: sName,
                    application_deadline: deadlineInfo.formattedClosingDate,
                  }}
                />
              )}

              {isValidPublicUrl(sch.officialUrl) && (
                <a
                  href={sch.officialUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <span>{lang === 'ar' ? 'الموقع الرسمي للمنحة' : 'Official Scholarship Portal'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Benefits Supported by Entered Data Only (Section 9) */}
          {(sTuition || sAccom || typeof sch.stipendAmount === 'number' || sOther) && (
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase">
                {lang === 'ar' ? 'المزايا والتغطية المالية المؤكدة' : 'Confirmed Coverage & Benefits'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {sTuition && (
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{sTuition}</span>
                  </div>
                )}
                {sAccom && (
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{sAccom}</span>
                  </div>
                )}
                {typeof sch.stipendAmount === 'number' && (
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'ar' ? 'المخصص المالي:' : 'Stipend:'} {sch.stipendAmount}{' '}
                      {sch.stipendCurrency}/{sch.stipendPeriod}
                    </span>
                  </div>
                )}
                {sOther && (
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{sOther}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Details (Only rendered when non-empty) */}
          <div className="space-y-4">
            {sElig && (
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'شروط الأهلية' : 'Eligibility Criteria'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{sElig}</p>
              </div>
            )}
            {sLangReq && (
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'متطلبات اللغة' : 'Language Requirements'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{sLangReq}</p>
              </div>
            )}
            {sDocs && (
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'المستندات المطلوبة' : 'Required Documents'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{sDocs}</p>
              </div>
            )}
            {sDuration && (
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'مدة المنحة' : 'Scholarship Duration'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{sDuration}</p>
              </div>
            )}
            {sRenewal && (
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'شروط التجديد السنوي' : 'Annual Renewal Conditions'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{sRenewal}</p>
              </div>
            )}
            {sInstructions && (
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'تعليمات التقديم' : 'Application Instructions'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{sInstructions}</p>
              </div>
            )}
          </div>

          {publishedUniversities.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                {lang === 'ar' ? 'الجامعات المرتبطة بهذه المنحة' : 'Participating Universities'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {publishedUniversities.map((u) => (
                  <Link
                    key={u.id}
                    href={`/universities/${u.slug}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-brand-300 hover:text-brand-700"
                  >
                    {getLocalizedText(lang, u.nameAr, u.nameEn)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {lang === 'ar' ? `قدم استفسارك حول ${sName}` : `Inquire About ${sName}`}
          </h2>
          <InquiryFormClient
            lang={lang}
            universities={publishedUniversities.map((u) => ({
              id: u.id,
              nameEn: u.nameEn,
              nameAr: u.nameAr,
            }))}
            scholarships={[{ id: sch.id, nameEn: sch.nameEn, nameAr: sch.nameAr }]}
            defaultScholarshipId={sch.id}
          />
        </section>
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
