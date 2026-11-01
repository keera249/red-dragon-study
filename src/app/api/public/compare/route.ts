import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizePublicUniversity } from '@/lib/public-data';

export async function GET(req: NextRequest) {
  try {
    const slugsParam = req.nextUrl.searchParams.get('slugs') || '';
    const slugs = slugsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);

    const contactSetting = await prisma.contactSetting.findUnique({ where: { id: 'default' } });
    let enabledFields: string[] = [
      'location',
      'programs',
      'degreeLevels',
      'languages',
      'tuitionFees',
      'accommodationCosts',
      'scholarships',
      'funding',
      'requirements',
      'deadlines',
      'duration',
      'officialWebsite',
      'accommodationAvailability',
    ];
    if (contactSetting?.comparisonFieldsConfigJson) {
      try {
        const parsed = JSON.parse(contactSetting.comparisonFieldsConfigJson);
        if (Array.isArray(parsed)) enabledFields = parsed;
      } catch {
        // use default
      }
    }

    if (slugs.length === 0) {
      return NextResponse.json({ universities: [], enabledFields });
    }

    const raw = await prisma.university.findMany({
      where: {
        slug: { in: slugs },
        status: 'PUBLISHED',
      },
      include: {
        programs: { where: { status: 'PUBLISHED' } },
        fees: { where: { status: 'PUBLISHED' } },
        scholarshipLinks: { include: { scholarship: true } },
        sharedRequirements: { include: { requirement: true, override: true } },
        specificRequirements: { where: { status: 'PUBLISHED', isEnabled: true } },
        galleries: { include: { images: true } },
        deadlines: { where: { status: 'PUBLISHED' } },
      },
    });

    const universities = raw
      .map((u) => sanitizePublicUniversity(u))
      .filter(Boolean);

    return NextResponse.json({ universities, enabledFields });
  } catch (err) {
    console.error('Compare API error:', err);
    return NextResponse.json({ error: 'Failed to load comparison data' }, { status: 500 });
  }
}
