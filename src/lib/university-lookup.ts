import {
  KNOWN_CHINESE_UNIVERSITIES,
  KnownUniversity,
  QS_EDITION_YEAR,
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

// ── QS ranking helpers ─────────────────────────────────────────────────────

export interface QsRanking {
  rank: string; // "13" or "401-410"
  year: number;
  source: 'ADMIN' | 'DATASET';
}

const QS_PATTERN = /QS[^0-9#]*?(\d{4})?\s*[:\-–]?\s*#\s*(\d{1,4}(?:\s*[-–]\s*\d{0,4})?)/i;

/** Canonical strings stored in `rankingInfoEn` / `rankingInfoAr` when the admin confirms a QS rank. */
export function formatQsRankingInfo(rank: string, year: number = QS_EDITION_YEAR) {
  const clean = rank.replace(/\s+/g, '').replace('–', '-').replace(/^#/, '');
  return {
    rankingInfoEn: `QS World University Rankings ${year}: #${clean}`,
    rankingInfoAr: `تصنيف QS العالمي للجامعات ${year}: المرتبة #${clean}`,
  };
}

export function parseQsRankingInfo(text: string | null | undefined): { rank: string; year: number | null } | null {
  if (!text) return null;
  const m = text.match(QS_PATTERN);
  if (!m) return null;
  return { rank: m[2].replace(/\s+/g, '').replace('–', '-'), year: m[1] ? Number(m[1]) : null };
}

/**
 * Resolves the QS ranking to display publicly.
 * 1. Admin-confirmed value stored in `rankingInfoEn` always wins.
 * 2. Otherwise only cross-verified dataset values are used — never unverified or guessed ranks.
 */
export function resolveQsRanking(uni: {
  nameEn?: string | null;
  nameZh?: string | null;
  nameAr?: string | null;
  rankingInfoEn?: string | null;
}): QsRanking | null {
  const fromAdmin = parseQsRankingInfo(uni.rankingInfoEn);
  if (fromAdmin) {
    return { rank: fromAdmin.rank.replace(/-$/, ''), year: fromAdmin.year ?? QS_EDITION_YEAR, source: 'ADMIN' };
  }
  const known =
    findKnownUniversity(uni.nameEn) || findKnownUniversity(uni.nameZh) || findKnownUniversity(uni.nameAr);
  if (known?.qs?.verified) {
    return { rank: known.qs.rank, year: known.qs.year, source: 'DATASET' };
  }
  return null;
}
