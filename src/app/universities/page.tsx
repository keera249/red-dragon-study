import React from 'react';
import Link from 'next/link';
import { MapPin, Search, ShieldCheck, SlidersHorizontal, Scale } from 'lucide-react';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import { searchPublicUniversities } from '@/lib/public-data';
import { getLocalizedText } from '@/lib/visibility';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { CompareToggleButton } from '@/components/CompareToggleButton';

export default async function UniversitiesDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const page = sp?.page ? Number(sp.page) : 1;
  const minTuition = sp?.minTuition ? Number(sp.minTuition) : undefined;
  const maxTuition = sp?.maxTuition ? Number(sp.maxTuition) : undefined;

  const searchResult = await searchPublicUniversities({
    q: sp?.q,
    city: sp?.city,
    province: sp?.province,
    degreeLevel: sp?.degreeLevel,
    language: sp?.language,
    minTuition,
    maxTuition,
    hasScholarship: sp?.hasScholarship === 'true' ? true : undefined,
    fundingType: sp?.fundingType,
    applicationStatus: sp?.applicationStatus,
    hasAccommodation: sp?.hasAccommodation === 'true' ? true : undefined,
    sortBy: (sp?.sortBy as any) || 'name',
    page,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.nav.universities}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{t.tagline}</p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-bold text-brand-800 hover:bg-brand-100 transition self-start"
          >
            <Scale className="h-4 w-4" />
            <span>{t.nav.compare}</span>
          </Link>
        </div>

        {/* Search & Filter Panel */}
        <form
          method="GET"
          action="/universities"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="h-4 w-4 text-slate-400 absolute top-3.5 start-3.5" />
              <input
                type="text"
                name="q"
                defaultValue={sp?.q || ''}
                placeholder={t.common.searchPlaceholder}
                className="w-full rounded-xl border border-slate-300 ps-10 pe-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
              />
            </div>

            {searchResult.facets.cities.length > 0 && (
              <div className="md:col-span-3">
                <select
                  name="city"
                  defaultValue={sp?.city || 'ALL'}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
                >
                  <option value="ALL">
                    {t.common.filterByCity}: {t.common.allOptions}
                  </option>
                  {searchResult.facets.cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-3">
              <select
                name="sortBy"
                defaultValue={sp?.sortBy || 'name'}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
              >
                <option value="name">
                  {t.common.sortBy}: {t.common.sortName}
                </option>
                <option value="recent">
                  {t.common.sortBy}: {t.common.sortRecent}
                </option>
                <option value="updated">
                  {t.common.sortBy}: {t.common.sortUpdated}
                </option>
                <option value="deadline">
                  {t.common.sortBy}: {t.common.sortDeadline}
                </option>
                <option value="tuition">
                  {t.common.sortBy}: {t.common.sortTuition}
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
            <select
              name="degreeLevel"
              defaultValue={sp?.degreeLevel || 'ALL'}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-brand-700 focus:outline-none"
            >
              <option value="ALL">
                {t.common.filterByDegree}: {t.common.allOptions}
              </option>
              <option value="BACHELOR">{t.degrees.BACHELOR}</option>
              <option value="MASTER">{t.degrees.MASTER}</option>
              <option value="PHD">{t.degrees.PHD}</option>
              <option value="LANGUAGE">{t.degrees.LANGUAGE}</option>
            </select>

            <select
              name="language"
              defaultValue={sp?.language || 'ALL'}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-brand-700 focus:outline-none"
            >
              <option value="ALL">
                {t.common.filterByLanguage}: {t.common.allOptions}
              </option>
              <option value="ENGLISH">{t.languages.ENGLISH}</option>
              <option value="CHINESE">{t.languages.CHINESE}</option>
              <option value="BILINGUAL">{t.languages.BILINGUAL}</option>
            </select>

            <select
              name="fundingType"
              defaultValue={sp?.fundingType || 'ALL'}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-brand-700 focus:outline-none"
            >
              <option value="ALL">
                {t.common.filterByFunding}: {t.common.allOptions}
              </option>
              <option value="FULL">{t.funding.FULL}</option>
              <option value="PARTIAL">{t.funding.PARTIAL}</option>
            </select>

            <select
              name="applicationStatus"
              defaultValue={sp?.applicationStatus || 'ALL'}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-brand-700 focus:outline-none"
            >
              <option value="ALL">
                {t.common.filterByStatus}: {t.common.allOptions}
              </option>
              <option value="OPEN">{lang === 'ar' ? 'مفتوح للتقديم' : 'Open'}</option>
              <option value="DEADLINE_APPROACHING">
                {lang === 'ar' ? 'يقترب الموعد النهائي' : 'Deadline Approaching'}
              </option>
            </select>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800 transition"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>{t.common.searchBtn}</span>
              </button>
              <Link
                href="/universities"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {t.common.resetFilters}
              </Link>
            </div>
          </div>
        </form>

        {/* Results Grid or Empty State */}
        {searchResult.items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4">
            <p className="text-base font-semibold text-slate-700">{t.common.noResultsFound}</p>
            <Link
              href="/universities"
              className="inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white"
            >
              {t.common.resetFilters}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResult.items.map((uni) => {
              const uName = getLocalizedText(lang, uni.nameAr, uni.nameEn);
              const uDesc = getLocalizedText(lang, uni.shortDescriptionAr, uni.shortDescriptionEn);

              return (
                <div
                  key={uni.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src="/logo.jpeg"
                        alt={uName || uni.nameEn}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-mono font-black text-amber-950 mb-1">
                          {lang === 'ar' ? `كود الجامعة: ${uni.universityCode}` : `Code: ${uni.universityCode}`}
                        </span>
                        <h2 className="font-bold text-slate-900 text-base">{uName}</h2>
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

                  {uni.programs.length > 0 && (
                    <div className="mb-4 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">
                        {t.common.programs} ({uni.programs.length})
                      </div>
                      {uni.programs.slice(0, 2).map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 truncate max-w-[65%]">
                            {getLocalizedText(lang, p.nameAr, p.nameEn)}
                          </span>
                          {typeof p.tuitionAmount === 'number' && (
                            <span className="text-brand-700 font-semibold">
                              {p.tuitionAmount.toLocaleString()} {p.tuitionCurrency}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/universities/${uni.universityCode || uni.slug}`}
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
        )}

        {/* Pagination */}
        {searchResult.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: searchResult.totalPages }, (_, i) => i + 1).map((pNum) => (
              <Link
                key={pNum}
                href={`/universities?page=${pNum}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold ${
                  pNum === searchResult.page
                    ? 'bg-brand-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pNum}
              </Link>
            ))}
          </div>
        )}
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
