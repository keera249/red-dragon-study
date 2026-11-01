'use client';

import React, { useEffect, useState } from 'react';
import { Scale, Check } from 'lucide-react';
import { SupportedLocale, UI_LABELS } from '@/lib/i18n';

const COMPARE_STORAGE_KEY = 'rds_compare_slugs';

export function getStoredCompareSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function setStoredCompareSlugs(slugs: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(slugs.slice(0, 4)));
  window.dispatchEvent(new Event('rds-compare-updated'));
}

export function CompareToggleButton({
  slug,
  lang,
}: {
  slug: string;
  lang: SupportedLocale;
}) {
  const [selected, setSelected] = useState(false);
  const t = UI_LABELS[lang].common;

  useEffect(() => {
    const sync = () => {
      const list = getStoredCompareSlugs();
      setSelected(list.includes(slug));
    };
    sync();
    window.addEventListener('rds-compare-updated', sync);
    return () => window.removeEventListener('rds-compare-updated', sync);
  }, [slug]);

  const toggle = () => {
    const current = getStoredCompareSlugs();
    if (current.includes(slug)) {
      setStoredCompareSlugs(current.filter((s) => s !== slug));
    } else {
      if (current.length >= 4) {
        alert(
          lang === 'ar'
            ? 'يمكنك مقارنة ما يصل إلى 4 جامعات في وقت واحد.'
            : 'You can compare up to 4 universities at a time.'
        );
        return;
      }
      setStoredCompareSlugs([...current, slug]);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        selected
          ? 'border-brand-700 bg-brand-50 text-brand-800'
          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700'
      }`}
    >
      {selected ? <Check className="h-3.5 w-3.5 text-brand-700" /> : <Scale className="h-3.5 w-3.5" />}
      <span>{selected ? t.removeFromCompare : t.addToCompare}</span>
    </button>
  );
}
