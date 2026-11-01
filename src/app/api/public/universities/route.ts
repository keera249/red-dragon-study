import { NextRequest, NextResponse } from 'next/server';
import { searchPublicUniversities } from '@/lib/public-data';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const minTuition = sp.get('minTuition') ? Number(sp.get('minTuition')) : undefined;
    const maxTuition = sp.get('maxTuition') ? Number(sp.get('maxTuition')) : undefined;
    const page = sp.get('page') ? Number(sp.get('page')) : 1;
    const pageSize = sp.get('pageSize') ? Number(sp.get('pageSize')) : undefined;

    const result = await searchPublicUniversities({
      q: sp.get('q') || undefined,
      city: sp.get('city') || undefined,
      province: sp.get('province') || undefined,
      degreeLevel: sp.get('degreeLevel') || undefined,
      language: sp.get('language') || undefined,
      minTuition,
      maxTuition,
      hasScholarship: sp.get('hasScholarship') === 'true' ? true : undefined,
      fundingType: sp.get('fundingType') || undefined,
      applicationStatus: sp.get('applicationStatus') || undefined,
      hasAccommodation: sp.get('hasAccommodation') === 'true' ? true : undefined,
      sortBy: (sp.get('sortBy') as any) || 'name',
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Public university search error:', err);
    return NextResponse.json({ error: 'Failed to search universities' }, { status: 500 });
  }
}
