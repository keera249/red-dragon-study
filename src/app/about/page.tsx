import React from 'react';
import { getCurrentLocale } from '@/lib/i18n-server';
import { DynamicPageView } from '@/components/DynamicPageView';

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  return <DynamicPageView slug="about" lang={lang} />;
}
