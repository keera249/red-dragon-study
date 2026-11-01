'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Plus, Scale, Trash2 } from 'lucide-react';
import { SupportedLocale, UI_LABELS } from '@/lib/i18n';
import { getLocalizedText } from '@/lib/visibility';
import { getStoredCompareSlugs, setStoredCompareSlugs } from './CompareToggleButton';

export function CompareTableClient({
  lang,
  allPublishedUniversities,
}: {
  lang: SupportedLocale;
  allPublishedUniversities: Array<{ slug: string; nameEn: string; nameAr?: string | null }>;
}) {
  const t = UI_LABELS[lang];
  const [slugs, setSlugs] = useState<string[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [enabledFields, setEnabledFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addSlug, setAddSlug] = useState('');

  useEffect(() => {
    const stored = getStoredCompareSlugs();
    if (stored.length === 0 && allPublishedUniversities.length >= 2) {
      const defaults = allPublishedUniversities.slice(0, 2).map((u) => u.slug);
      setStoredCompareSlugs(defaults);
      setSlugs(defaults);
    } else {
      setSlugs(stored);
    }
  }, [allPublishedUniversities]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/compare?slugs=${encodeURIComponent(slugs.join(','))}`);
        const data = await res.json();
        setUniversities(data.universities || []);
        setEnabledFields(data.enabledFields || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slugs]);

  const removeUniversity = (slugToRemove: string) => {
    const next = slugs.filter((s) => s !== slugToRemove);
    setStoredCompareSlugs(next);
    setSlugs(next);
  };

  const handleAddUniversity = () => {
    if (!addSlug || slugs.includes(addSlug)) return;
    if (slugs.length >= 4) return;
    const next = [...slugs, addSlug];
    setStoredCompareSlugs(next);
    setSlugs(next);
    setAddSlug('');
  };

  const naText = t.common.notAvailable;

  return (
    <div className="space-y-6">
      {/* Add to Compare Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Scale className="h-4 w-4 text-brand-700" />
          <span>
            {lang === 'ar'
              ? `الجامعات المختارة للمقارنة (${universities.length}/4)`
              : `Selected Universities for Comparison (${universities.length}/4)`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={addSlug}
            onChange={(e) => setAddSlug(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
          >
            <option value="">
              {lang === 'ar' ? '+ اختر جامعة لإضافتها للمقارنة' : '+ Select a university to add'}
            </option>
            {allPublishedUniversities
              .filter((u) => !slugs.includes(u.slug))
              .map((u) => (
                <option key={u.slug} value={u.slug}>
                  {lang === 'ar' ? u.nameAr || u.nameEn : u.nameEn}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleAddUniversity}
            disabled={!addSlug || slugs.length >= 4}
            className="inline-flex items-center gap-1 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? 'إضافة' : 'Add'}</span>
          </button>
          <Link
            href="/universities"
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {lang === 'ar' ? 'العودة لدليل الجامعات' : 'Return to Directory'}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          {lang === 'ar' ? 'جاري تحميل جدول المقارنة...' : 'Loading comparison table...'}
        </div>
      ) : universities.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            {lang === 'ar'
              ? 'لم يتم اختيار أي جامعة للمقارنة حالياً.'
              : 'No universities are currently selected for comparison.'}
          </p>
          <Link
            href="/universities"
            className="inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white"
          >
            {t.nav.universities}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-start text-sm border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-xs font-bold uppercase text-slate-500 w-48 text-start">
                  {lang === 'ar' ? 'معيار المقارنة' : 'Comparison Criterion'}
                </th>
                {universities.map((u) => (
                  <th key={u.id} className="p-4 text-start align-top border-s border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/universities/${u.slug}`}
                          className="text-base font-extrabold text-brand-800 hover:underline block"
                        >
                          {getLocalizedText(lang, u.nameAr, u.nameEn)}
                        </Link>
                        {u.nameZh && (
                          <span className="text-xs text-slate-500 block">{u.nameZh}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUniversity(u.slug)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title={t.common.removeFromCompare}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {enabledFields.includes('location') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {lang === 'ar' ? 'المدينة والمقاطعة' : 'City & Province'}
                  </td>
                  {universities.map((u) => (
                    <td key={u.id} className="p-4 border-s border-slate-100">
                      {[u.city, u.province].filter(Boolean).join(', ') || naText}
                    </td>
                  ))}
                </tr>
              )}

              {enabledFields.includes('programs') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {t.common.programs}
                  </td>
                  {universities.map((u) => (
                    <td key={u.id} className="p-4 border-s border-slate-100">
                      {u.programs.length > 0
                        ? u.programs
                            .map((p: any) => getLocalizedText(lang, p.nameAr, p.nameEn))
                            .join(' • ')
                        : naText}
                    </td>
                  ))}
                </tr>
              )}

              {enabledFields.includes('degreeLevels') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {t.common.filterByDegree}
                  </td>
                  {universities.map((u) => {
                    const degrees = Array.from(
                      new Set(u.programs.map((p: any) => t.degrees[p.degreeLevel] || p.degreeLevel))
                    );
                    return (
                      <td key={u.id} className="p-4 border-s border-slate-100">
                        {degrees.length > 0 ? degrees.join(', ') : naText}
                      </td>
                    );
                  })}
                </tr>
              )}

              {enabledFields.includes('languages') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {t.common.filterByLanguage}
                  </td>
                  {universities.map((u) => {
                    const langs = Array.from(
                      new Set(
                        u.programs.map(
                          (p: any) =>
                            t.languages[p.languageOfInstruction] || p.languageOfInstruction
                        )
                      )
                    );
                    return (
                      <td key={u.id} className="p-4 border-s border-slate-100">
                        {langs.length > 0 ? langs.join(', ') : naText}
                      </td>
                    );
                  })}
                </tr>
              )}

              {enabledFields.includes('tuitionFees') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {lang === 'ar' ? 'الرسوم الدراسية (حسب العملة والفترة)' : 'Tuition Fees (with Currency & Period)'}
                  </td>
                  {universities.map((u) => {
                    const tuitionItems = u.programs
                      .filter((p: any) => typeof p.tuitionAmount === 'number')
                      .map(
                        (p: any) =>
                          `${p.tuitionAmount.toLocaleString()} ${p.tuitionCurrency} (${
                            t.periods[p.tuitionPeriod] || p.tuitionPeriod
                          })`
                      );
                    return (
                      <td key={u.id} className="p-4 border-s border-slate-100 font-semibold text-brand-700">
                        {tuitionItems.length > 0 ? tuitionItems.join(' | ') : naText}
                      </td>
                    );
                  })}
                </tr>
              )}

              {enabledFields.includes('accommodationCosts') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {lang === 'ar' ? 'تكلفة السكن الطلابي' : 'Accommodation Costs'}
                  </td>
                  {universities.map((u) => {
                    const accomFees = u.fees
                      .filter((f: any) => f.category === 'ACCOMMODATION')
                      .map(
                        (f: any) =>
                          `${Number(f.amount).toLocaleString()} ${f.currency} (${
                            t.periods[f.period] || f.period
                          } - ${f.isConfirmed ? t.common.confirmedFee : t.common.estimatedFee})`
                      );
                    return (
                      <td key={u.id} className="p-4 border-s border-slate-100">
                        {accomFees.length > 0 ? accomFees.join(' | ') : naText}
                      </td>
                    );
                  })}
                </tr>
              )}

              {enabledFields.includes('scholarships') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {t.common.scholarships}
                  </td>
                  {universities.map((u) => (
                    <td key={u.id} className="p-4 border-s border-slate-100">
                      {u.scholarships.length > 0
                        ? u.scholarships
                            .map((s: any) => getLocalizedText(lang, s.nameAr, s.nameEn))
                            .join(' • ')
                        : naText}
                    </td>
                  ))}
                </tr>
              )}

              {enabledFields.includes('requirements') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {t.common.requirements}
                  </td>
                  {universities.map((u) => (
                    <td key={u.id} className="p-4 border-s border-slate-100">
                      {u.requirements.length > 0 ? (
                        <ul className="space-y-1">
                          {u.requirements.slice(0, 5).map((r: any) => (
                            <li key={r.id}>
                              • {getLocalizedText(lang, r.nameAr, r.nameEn)} (
                              {r.isRequired ? t.common.requiredDoc : t.common.optionalDoc})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        naText
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {enabledFields.includes('deadlines') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {t.common.deadlines}
                  </td>
                  {universities.map((u) => (
                    <td key={u.id} className="p-4 border-s border-slate-100">
                      {u.deadlines.length > 0
                        ? u.deadlines
                            .map(
                              (d: any) =>
                                `${
                                  d.evaluated.formattedClosingDate ||
                                  (lang === 'ar' ? d.evaluated.labelAr : d.evaluated.labelEn)
                                }`
                            )
                            .join(' • ')
                        : naText}
                    </td>
                  ))}
                </tr>
              )}

              {enabledFields.includes('accommodationAvailability') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {lang === 'ar' ? 'توفر السكن الجامعي' : 'On-Campus Accommodation'}
                  </td>
                  {universities.map((u) => (
                    <td key={u.id} className="p-4 border-s border-slate-100">
                      {u.accommodationAvailable === true
                        ? getLocalizedText(lang, u.accommodationDescAr, u.accommodationDescEn) ||
                          (lang === 'ar' ? 'متوفر' : 'Available')
                        : naText}
                    </td>
                  ))}
                </tr>
              )}

              {enabledFields.includes('officialWebsite') && (
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">
                    {t.common.officialWebsite}
                  </td>
                  {universities.map((u) => (
                    <td key={u.id} className="p-4 border-s border-slate-100">
                      {u.officialWebsite ? (
                        <a
                          href={u.officialWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
                        >
                          <span>{t.common.officialWebsite}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        naText
                      )}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
