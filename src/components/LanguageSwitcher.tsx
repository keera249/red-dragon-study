'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { SupportedLocale } from '@/lib/i18n';

export function LanguageSwitcher({ currentLang }: { currentLang: SupportedLocale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleLanguage = async () => {
    const nextLang: SupportedLocale = currentLang === 'ar' ? 'en' : 'ar';
    setLoading(true);
    try {
      await fetch('/api/lang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: nextLang }),
      });
      document.documentElement.lang = nextLang;
      document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-700 transition"
      aria-label={currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Globe className="h-4 w-4 text-brand-700" />
      <span>{currentLang === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
}
