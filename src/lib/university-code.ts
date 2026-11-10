/**
 * University Code Generation & Identity Masking Utilities
 *
 * Ensures that:
 * 1. Every university added by the Admin automatically receives a deterministic, unique
 *    reference code (e.g., UNI-4821) derived from its name.
 * 2. On the public website, the real university name, Chinese name, logo, and official
 *    website URLs are completely hidden and replaced by the reference code so students
 *    use the code when contacting the Admin.
 * 3. In the Admin Dashboard, a single unified search input allows searching by either
 *    the university code (e.g., "UNI-4821" or "4821") OR the real university name.
 */

const GENERIC_EN_WORDS = new Set([
  'university',
  'college',
  'institute',
  'academy',
  'school',
  'of',
  'and',
  'the',
  'in',
  'for',
  'at',
  'on',
  'china',
  'chinese',
  'national',
  'international',
  'science',
  'sciences',
  'technology',
  'technological',
  'medical',
  'medicine',
  'engineering',
  'studies',
  'normal',
  'polytechnic',
  'agricultural',
  'agriculture',
  'forestry',
  'ocean',
  'petroleum',
  'finance',
  'economics',
  'economic',
  'law',
  'political',
  'arts',
  'art',
  'language',
  'languages',
  'culture',
  'business',
  'management',
  'capital',
  'central',
  'south',
  'north',
  'east',
  'west',
  'southern',
  'northern',
  'eastern',
  'western',
  'post',
  'telecommunications',
  'communications',
  'communication',
  'transportation',
  'jiaotong',
  'aeronautics',
  'astronautics',
  'mining',
  'power',
  'electric',
  'electrical',
  'chemical',
  'electronic',
  'electronics',
  'information',
  'civil',
  'aviation',
  'maritime',
  'traditional',
  'pharmaceutical',
  'pharmacy',
  'sports',
  'music',
  'fine',
  'foreign',
  'trade',
  'relations',
  'public',
  'research',
  'state',
  'key',
  'copy',
]);

const GENERIC_AR_WORDS = new Set([
  'جامعة',
  'كلية',
  'معهد',
  'أكاديمية',
  'مدرسة',
  'الصين',
  'الصينية',
  'الوطنية',
  'الدولية',
  'للعلوم',
  'والتكنولوجيا',
  'العلوم',
  'التكنولوجيا',
  'الطبية',
  'الطب',
  'الهندسة',
  'الدراسات',
  'المعلمين',
  'التربية',
  'الزراعية',
  'الزراعة',
  'الغابات',
  'المحيطات',
  'البترول',
  'النفط',
  'المالية',
  'والاقتصاد',
  'الاقتصاد',
  'القانون',
  'السياسة',
  'الفنون',
  'اللغات',
  'الأجنبية',
  'الثقافة',
  'الأعمال',
  'الإدارة',
  'العاصمة',
  'المركزية',
  'جنوب',
  'شمال',
  'شرق',
  'غرب',
  'الجنوبية',
  'الشمالية',
  'الشرقية',
  'الغربية',
  'الاتصالات',
  'المواصلات',
  'النقل',
  'الطيران',
  'الفضاء',
  'التعدين',
  'الطاقة',
  'الكهربائية',
  'الكيميائية',
  'الإلكترونية',
  'المعلومات',
  'البحرية',
  'التقليدي',
  'الصيدلة',
  'الرياضية',
  'التجارة',
  'التطبيقية',
  'التقنية',
  'العامة',
  'الحكومية',
  'نسخة',
  'في',
  'من',
  'على',
  'إلى',
  'عن',
]);

/**
 * Generates a deterministic 4-digit numeric string (1001 - 9999) from a university name.
 */
export function getUniversityNumericCode(nameEnOrSeed: string): string {
  const clean = (nameEnOrSeed || 'university').trim().toLowerCase().replace(/\s+/g, ' ');
  let h1 = 0x811c9dc5;
  let h2 = 5381;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 = (Math.imul(h2, 33) ^ ch) >>> 0;
  }
  const combined = ((h1 >>> 0) ^ h2) >>> 0;
  const num = 1001 + (combined % 8999); // Always 4 digits: 1001..9999
  return String(num);
}

/**
 * Generates the formatted University Code (e.g. "UNI-4821") based on the university name.
 */
export function generateUniversityCode(
  uniOrName:
    | string
    | { nameEn?: string | null; slug?: string | null; id?: string | null }
    | null
    | undefined
): string {
  if (!uniOrName) return 'UNI-1000';
  if (typeof uniOrName === 'string') {
    return `UNI-${getUniversityNumericCode(uniOrName)}`;
  }
  const seed = uniOrName.nameEn || uniOrName.slug || uniOrName.id || 'university';
  return `UNI-${getUniversityNumericCode(seed)}`;
}

/**
 * Returns the localized public display title using only the University Code.
 */
export function getPublicUniversityName(code: string, lang: 'ar' | 'en'): string {
  const cleanCode = code.startsWith('UNI-') ? code : `UNI-${code}`;
  return lang === 'ar' ? `جامعة معتمدة — كود #${cleanCode}` : `Accredited University — Code #${cleanCode}`;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scrubs any occurrence of the university's real English, Arabic, or Chinese name,
 * distinctive name words, or official website URLs from public description text.
 */
export function maskUniversityIdentityInText(
  text: string | null | undefined,
  uni: {
    nameEn?: string | null;
    nameAr?: string | null;
    nameZh?: string | null;
    slug?: string | null;
    officialWebsite?: string | null;
  },
  code: string
): string | null {
  if (!text || typeof text !== 'string') return text ?? null;

  let result = text;
  const hasArabicChars = /[\u0600-\u06FF]/.test(result);
  const replacementAr = `الجامعة المعتمدة (كود #${code})`;
  const replacementEn = `the Accredited University (Code #${code})`;
  const defaultReplacement = hasArabicChars ? replacementAr : replacementEn;

  // 1. Remove any embedded URLs (e.g., https://www.tsinghua.edu.cn)
  result = result.replace(/https?:\/\/[^\s)]+/gi, '');
  result = result.replace(/\bwww\.[a-z0-9.-]+\.[a-z]{2,}\b/gi, '');
  result = result.replace(/\b[a-z0-9.-]+\.edu\.cn\b/gi, '');

  // 2. Replace full Chinese name if present
  if (uni.nameZh && uni.nameZh.trim().length >= 2) {
    const zhRegex = new RegExp(escapeRegExp(uni.nameZh.trim()), 'gi');
    result = result.replace(zhRegex, defaultReplacement);
  }

  // 3. Replace full Arabic name if present
  if (uni.nameAr && uni.nameAr.trim().length >= 3) {
    const arRegex = new RegExp(escapeRegExp(uni.nameAr.trim()), 'gi');
    result = result.replace(arRegex, replacementAr);
  }

  // 4. Replace full English name if present
  if (uni.nameEn && uni.nameEn.trim().length >= 3) {
    const enRegex = new RegExp(escapeRegExp(uni.nameEn.trim()), 'gi');
    result = result.replace(enRegex, replacementEn);
  }

  // 5. Replace distinctive English tokens (e.g., "Tsinghua", "Zhejiang", "Fudan", "Peking", "Beihang")
  if (uni.nameEn) {
    const enTokens = uni.nameEn
      .split(/[\s,()\-–—/]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3 && !GENERIC_EN_WORDS.has(t.toLowerCase()));

    for (const token of enTokens) {
      const tokenRegex = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'gi');
      result = result.replace(tokenRegex, `Code #${code}`);
    }
  }

  // 6. Replace distinctive Arabic tokens (e.g., "تشينغهوا", "تشجيانغ", "فودان", "ووهان")
  if (uni.nameAr) {
    const arTokens = uni.nameAr
      .split(/[\s,،()\-–—/]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3 && !GENERIC_AR_WORDS.has(t));

    for (const token of arTokens) {
      const tokenRegex = new RegExp(escapeRegExp(token), 'g');
      result = result.replace(tokenRegex, `كود #${code}`);
    }
  }

  return result.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Unified matcher for Admin & Public search:
 * Matches if the query matches EITHER the generated University Code (e.g. "UNI-4821" or "4821")
 * OR the university's real name (English, Arabic, Chinese), slug, or city/province.
 */
export function matchesUniversityCodeOrName(
  uni: {
    id?: string | null;
    slug?: string | null;
    nameEn?: string | null;
    nameAr?: string | null;
    nameZh?: string | null;
    city?: string | null;
    province?: string | null;
    universityCode?: string | null;
  },
  rawQuery: string
): boolean {
  const q = (rawQuery || '').trim().toLowerCase().replace(/^#/, '');
  if (!q) return true;

  const code = (uni.universityCode || generateUniversityCode(uni)).toLowerCase();
  const numericOnly = code.replace(/^uni-/, '');
  const compactCode = code.replace(/-/g, '');
  const compactQuery = q.replace(/[-\s]/g, '');

  if (
    code.includes(q) ||
    numericOnly.includes(q) ||
    compactCode.includes(compactQuery)
  ) {
    return true;
  }

  const fields = [uni.nameEn, uni.nameAr, uni.nameZh, uni.slug, uni.city, uni.province];
  return fields.some((f) => typeof f === 'string' && f.toLowerCase().includes(q));
}
