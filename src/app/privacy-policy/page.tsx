import React from 'react';
import { getCurrentLocale } from '@/lib/i18n-server';
import { DynamicPageView } from '@/components/DynamicPageView';

export default async function PrivacyPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  return <DynamicPageView slug="privacy-policy" lang={lang} />;
}
