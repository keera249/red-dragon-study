import React from 'react';
import Link from 'next/link';
import { Award, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import { getLocalizedText } from '@/lib/visibility';
import { evaluateDeadline } from '@/lib/deadlines';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

export default async function ScholarshipsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const [sys, rawScholarships, universities] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.scholarship.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        universityLinks: {
          include: {
            university: {
              select: { id: true, nameEn: true, nameAr: true, slug: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.university.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, nameEn: true, nameAr: true },
      orderBy: { nameEn: 'asc' },
    }),
  ]);

  const warningDays = sys?.deadlineWarningDays ?? 30;

  let items = rawScholarships.map((s) => ({
    ...s,
    deadlineInfo: evaluateDeadline(
      { openingDate: s.openingDate, closingDate: s.deadlineDate, status: s.status },
      { warningDays, locale: lang }
    ),
    publishedUniversities: s.universityLinks
      .map((l) => l.university)
      .filter((u) => u && u.status === 'PUBLISHED'),
  }));

  if (sp?.fundingType && sp.fundingType !== 'ALL') {
    items = items.filter((s) => s.fundingType === sp.fundingType);
  }
  if (sp?.degreeLevel && sp.degreeLevel !== 'ALL') {
    items = items.filter((s) => (s.degreeLevelsJson || '').includes(sp.degreeLevel!));
  }
  if (sp?.universityId && sp.universityId !== 'ALL') {
    items = items.filter((s) => s.publishedUniversities.some((u) => u.id === sp.universityId));
  }
  if (sp?.status && sp.status !== 'ALL') {
    items = items.filter((s) => s.deadlineInfo.status === sp.status);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.nav.scholarships}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {lang === 'ar'
              ? 'استكشف المنح الدراسية الحكومية والجامعية الموثقة وشروط الأهلية الفعلية.'
              : 'Explore verified government, provincial, and university scholarships with transparent benefits.'}
          </p>
        </div>

        {/* Filters */}
        <form
          method="GET"
          action="/scholarships"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3"
        >
          <select
            name="fundingType"
            defaultValue={sp?.fundingType || 'ALL'}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium"
          >
            <option value="ALL">
              {t.common.filterByFunding}: {t.common.allOptions}
            </option>
            <option value="FULL">{t.funding.FULL}</option>
            <option value="PARTIAL">{t.funding.PARTIAL}</option>
          </select>

          <select
            name="degreeLevel"
            defaultValue={sp?.degreeLevel || 'ALL'}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium"
          >
            <option value="ALL">
              {t.common.filterByDegree}: {t.common.allOptions}
            </option>
            <option value="BACHELOR">{t.degrees.BACHELOR}</option>
            <option value="MASTER">{t.degrees.MASTER}</option>
            <option value="PHD">{t.degrees.PHD}</option>
          </select>

          <select
            name="universityId"
            defaultValue={sp?.universityId || 'ALL'}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium"
          >
            <option value="ALL">
              {lang === 'ar' ? 'الجامعة:' : 'University:'} {t.common.allOptions}
            </option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {lang === 'ar' ? u.nameAr || u.nameEn : u.nameEn}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={sp?.status || 'ALL'}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium"
          >
            <option value="ALL">
              {t.common.filterByStatus}: {t.common.allOptions}
            </option>
            <option value="OPEN">{lang === 'ar' ? 'مفتوح' : 'Open'}</option>
            <option value="DEADLINE_APPROACHING">
              {lang === 'ar' ? 'يقترب الموعد النهائي' : 'Deadline Approaching'}
            </option>
          </select>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-800"
            >
              {t.common.searchBtn}
            </button>
            <Link
              href="/scholarships"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600"
            >
              {t.common.resetFilters}
            </Link>
          </div>
        </form>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">{t.common.noResultsFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((sch) => {
              const sName = getLocalizedText(lang, sch.nameAr, sch.nameEn);
              const sProvider = getLocalizedText(lang, sch.providerAr, sch.providerEn);
              const sTuition = getLocalizedText(lang, sch.tuitionCoverageAr, sch.tuitionCoverageEn);
              const sAccom = getLocalizedText(
                lang,
                sch.accommodationCoverageAr,
                sch.accommodationCoverageEn
              );
              const sElig = getLocalizedText(lang, sch.eligibilityAr, sch.eligibilityEn);

              return (
                <div
                  key={sch.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200">
                        <Award className="h-3.5 w-3.5" />
                        {t.funding[sch.fundingType] || sch.fundingType}
                      </span>
                      {sch.verificationStatus === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {lang === 'ar' ? 'موثقة' : 'Verified'}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">{sName}</h2>
                    {sProvider && <p className="text-xs font-medium text-slate-500">{sProvider}</p>}

                    {/* Section 9: Only display benefits supported by information entered & reviewed */}
                    <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
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
                            {lang === 'ar' ? 'الراتب الشهري:' : 'Stipend:'} {sch.stipendAmount}{' '}
                            {sch.stipendCurrency}/{sch.stipendPeriod}
                          </span>
                        </li>
                      )}
                    </ul>

                    {sElig && <p className="text-xs text-slate-600 line-clamp-2">{sElig}</p>}

                    {sch.deadlineInfo.shouldDisplayPublicly &&
                      sch.deadlineInfo.formattedClosingDate && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                          <Calendar className="h-3.5 w-3.5 text-brand-700" />
                          <span>
                            {lang === 'ar' ? 'الموعد النهائي:' : 'Deadline:'}{' '}
                            <strong>{sch.deadlineInfo.formattedClosingDate}</strong>
                          </span>
                        </p>
                      )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/scholarships/${sch.slug}`}
                      className="rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800 transition"
                    >
                      {t.common.viewDetails}
                    </Link>
                    {sch.publishedUniversities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sch.publishedUniversities.slice(0, 2).map((u) => (
                          <Link
                            key={u.id}
                            href={`/universities/${u.slug}`}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-brand-700"
                          >
                            {getLocalizedText(lang, u.nameAr, u.nameEn)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
