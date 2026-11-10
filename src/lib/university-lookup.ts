import {
  KNOWN_CHINESE_UNIVERSITIES,
  KnownUniversity,
} from './china-universities-data';

function normalize(value: string | null | undefined): string {
  return (value || '')
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9\u0600-\u06ff\u4e00-\u9fff]+/g, ' ')
    .trim();
}

function namesOf(u: KnownUniversity): string[] {
  return [u.nameEn, u.nameZh, u.nameAr, ...(u.aliases || [])].map(normalize).filter(Boolean);
}

/** Exact match on any known name / alias (English, Chinese, Arabic). */
export function findKnownUniversity(name: string | null | undefined): KnownUniversity | null {
  const q = normalize(name);
  if (!q) return null;
  return KNOWN_CHINESE_UNIVERSITIES.find((u) => namesOf(u).includes(q)) ?? null;
}

/** Autocomplete suggestions while the admin is typing (exact matches first). */
export function suggestKnownUniversities(query: string, limit = 6): KnownUniversity[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const scored: Array<{ u: KnownUniversity; score: number }> = [];
  for (const u of KNOWN_CHINESE_UNIVERSITIES) {
    const names = namesOf(u);
    let score = 0;
    if (names.includes(q)) score = 3;
    else if (names.some((n) => n.startsWith(q))) score = 2;
    else if (q.length >= 3 && names.some((n) => n.includes(q))) score = 1;
    if (score) scored.push({ u, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.u.nameEn.localeCompare(b.u.nameEn))
    .slice(0, limit)
    .map((s) => s.u);
}
