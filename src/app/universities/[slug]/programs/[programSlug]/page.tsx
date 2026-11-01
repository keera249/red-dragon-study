import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, Calendar, ExternalLink, GraduationCap } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import { getLocalizedText, isRecordPubliclyVisible, isValidPublicUrl } from '@/lib/visibility';
import { evaluateDeadline } from '@/lib/deadlines';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { InquiryFormClient } from '@/components/InquiryFormClient';

export default async function AcademicProgramDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; programSlug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug, programSlug } = await params;
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const uni = await prisma.university.findUnique({
    where: { slug },
    include: {
      programs: {
        where: { slug: programSlug },
      },
    },
  });

  if (!uni || !isRecordPubliclyVisible(uni)) {
    notFound();
  }

  const prog = uni.programs[0];
  if (!prog || !isRecordPubliclyVisible(prog)) {
    notFound();
  }

  const [sys, contact, waTemplates] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.contactSetting.findUnique({ where: { id: 'default' } }),
    prisma.whatsAppTemplate.findMany({ where: { isEnabled: true } }),
  ]);

  const deadlineInfo = evaluateDeadline(
    {
      openingDate: prog.openingDate,
      closingDate: prog.deadlineDate,
      status: prog.status,
    },
    { warningDays: sys?.deadlineWarningDays ?? 30, locale: lang }
  );

  const uName = getLocalizedText(lang, uni.nameAr, uni.nameEn) || uni.nameEn;
  const pName = getLocalizedText(lang, prog.nameAr, prog.nameEn) || prog.nameEn;
  const pDiscipline = getLocalizedText(lang, prog.disciplineAr, prog.disciplineEn);
  const pDuration = getLocalizedText(lang, prog.durationAr, prog.durationEn);
  const pIntakes = getLocalizedText(lang, prog.intakePeriodsAr, prog.intakePeriodsEn);
  const pElig = getLocalizedText(lang, prog.eligibilityAr, prog.eligibilityEn);
  const pLangReq = getLocalizedText(lang, prog.languageReqAr, prog.languageReqEn);
  const pAcadReq = getLocalizedText(lang, prog.academicReqAr, prog.academicReqEn);
  const pExams = getLocalizedText(lang, prog.entranceExamsAr, prog.entranceExamsEn);
  const pNotes = getLocalizedText(lang, prog.additionalNotesAr, prog.additionalNotesEn);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div className="text-xs font-semibold text-slate-500">
          <Link href="/universities" className="hover:text-brand-700">
            {t.nav.universities}
          </Link>{' '}
          /{' '}
          <Link href={`/universities/${uni.slug}`} className="hover:text-brand-700">
            {uName}
          </Link>{' '}
          / <span className="text-slate-900">{pName}</span>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                  {t.degrees[prog.degreeLevel] || prog.degreeLevel}
                </span>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {t.languages[prog.languageOfInstruction] || prog.languageOfInstruction}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pName}</h1>
              {prog.nameZh && <p className="text-sm font-medium text-brand-700">{prog.nameZh}</p>}
              <p className="text-sm text-slate-600">{uName}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                    application_deadline: deadlineInfo.formattedClosingDate,
                  }}
                />
              )}

              {isValidPublicUrl(prog.officialProgramUrl) && (
                <a
                  href={prog.officialProgramUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <span>{lang === 'ar' ? 'رابط البرنامج الرسمي' : 'Official Program Page'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            {pDiscipline && (
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="text-xs text-slate-500 block">
                  {lang === 'ar' ? 'المجال الأكاديمي' : 'Academic Discipline'}
                </span>
                <strong className="text-sm text-slate-900">{pDiscipline}</strong>
              </div>
            )}
            {pDuration && (
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="text-xs text-slate-500 block">
                  {lang === 'ar' ? 'مدة الدراسة' : 'Program Duration'}
                </span>
                <strong className="text-sm text-slate-900">{pDuration}</strong>
              </div>
            )}
            {typeof prog.tuitionAmount === 'number' && (
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="text-xs text-slate-500 block">
                  {lang === 'ar' ? 'الرسوم الدراسية' : 'Tuition Fee'}
                </span>
                <strong className="text-sm text-brand-700">
                  {prog.tuitionAmount.toLocaleString()} {prog.tuitionCurrency} /{' '}
                  {t.periods[prog.tuitionPeriod] || prog.tuitionPeriod}
                </strong>
              </div>
            )}
            {deadlineInfo.shouldDisplayPublicly && (
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="text-xs text-slate-500 block">
                  {lang === 'ar' ? 'الموعد النهائي للتقديم' : 'Application Deadline'}
                </span>
                <strong className="text-sm text-slate-900">
                  {deadlineInfo.formattedClosingDate ||
                    (lang === 'ar' ? deadlineInfo.labelAr : deadlineInfo.labelEn)}
                </strong>
              </div>
            )}
          </div>

          {/* Only render optional fields that have actual content */}
          <div className="space-y-4 pt-4">
            {pIntakes && (
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'فصول الالتحاق المتاحة' : 'Intake Periods'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{pIntakes}</p>
              </div>
            )}
            {pElig && (
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'شروط الأهلية للبرنامج' : 'Program-Specific Eligibility Criteria'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{pElig}</p>
              </div>
            )}
            {pLangReq && (
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'متطلبات الكفاءة اللغوية' : 'Language Proficiency Requirements'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{pLangReq}</p>
              </div>
            )}
            {pAcadReq && (
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'المتطلبات الأكاديمية' : 'Academic Requirements'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{pAcadReq}</p>
              </div>
            )}
            {pExams && (
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'اختبارات القبول' : 'Entrance Examinations'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{pExams}</p>
              </div>
            )}
            {pNotes && (
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {lang === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{pNotes}</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {lang === 'ar' ? `قدم طلب استفسار لبرنامج ${pName}` : `Inquire About ${pName}`}
          </h2>
          <InquiryFormClient
            lang={lang}
            universities={[{ id: uni.id, nameEn: uni.nameEn, nameAr: uni.nameAr }]}
            defaultUniversityId={uni.id}
            defaultProgramId={prog.id}
          />
        </section>
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
