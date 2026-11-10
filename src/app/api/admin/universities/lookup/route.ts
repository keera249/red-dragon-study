import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { findKnownUniversity, suggestKnownUniversities } from '@/lib/university-lookup';
import { QS_SOURCE_URL } from '@/lib/china-universities-data';
import { lookupUniversityOnline } from '@/lib/university-online-lookup';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth('universities:write', req);
  if (auth.errorResponse) return auth.errorResponse;

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const mode = req.nextUrl.searchParams.get('mode') || 'full';
  if (q.length < 2) return NextResponse.json({ suggestions: [], result: null });

  const suggestions = suggestKnownUniversities(q).map((u) => ({
    nameEn: u.nameEn,
    nameAr: u.nameAr,
    nameZh: u.nameZh,
    city: u.city,
    province: u.province,
  }));
  if (mode === 'suggest') return NextResponse.json({ suggestions, result: null });

  const known = findKnownUniversity(q);
  const online = await lookupUniversityOnline(known?.nameEn || q);

  if (!known && !online) {
    return NextResponse.json({ suggestions, result: null });
  }

  const result = {
    matchedFrom: known ? (online ? 'DATASET+ONLINE' : 'DATASET') : 'ONLINE',
    nameEn: known?.nameEn || online?.nameEn || q,
    nameAr: known?.nameAr || online?.nameAr || null,
    nameZh: known?.nameZh || online?.nameZh || null,
    // Curated city/province always preferred over automatic Wikidata parsing
    city: known?.city || online?.city || null,
    cityAr: known?.cityAr || online?.cityAr || null,
    province: known?.province || online?.province || null,
    provinceAr: known?.provinceAr || online?.provinceAr || null,
    universityType: known?.universityType || null,
    descriptionEn: online?.descriptionEn || null,
    descriptionAr: online?.descriptionAr || null,
    infoSourceUrl: online?.sourceUrl || null,
    qs: known?.qs ? { ...known.qs, sourceUrl: QS_SOURCE_URL } : null,
  };

  return NextResponse.json({ suggestions, result });
}

