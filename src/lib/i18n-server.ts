import { cookies } from 'next/headers';
import { LANGUAGE_COOKIE_NAME, SupportedLocale } from './i18n';
import { prisma } from './prisma';

export async function getCurrentLocale(searchParamsLang?: string | null): Promise<SupportedLocale> {
  if (searchParamsLang === 'ar' || searchParamsLang === 'en') {
    return searchParamsLang;
  }
  try {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
    if (cookieLang === 'ar' || cookieLang === 'en') {
      return cookieLang;
    }
    const sys = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
    if (sys?.defaultLanguage === 'en') return 'en';
  } catch {
    // Default to Arabic per Section 2 & 21 requirements
  }
  return 'ar';
}
