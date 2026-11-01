import React from 'react';
import { getCurrentLocale } from '@/lib/i18n-server';
import { DynamicPageView } from '@/components/DynamicPageView';

export default async function CustomDynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  return <DynamicPageView slug={slug} lang={lang} />;
}
