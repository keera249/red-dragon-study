import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { recordAuditLog } from '@/lib/audit';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAuth('universities:read');
  if (auth.errorResponse) return auth.errorResponse;
  const { id } = await context.params;

  const university = await prisma.university.findUnique({
    where: { id },
    include: {
      programs: true,
      fees: true,
      sharedRequirements: { include: { requirement: true, override: true } },
      specificRequirements: true,
      galleries: { include: { images: true } },
      deadlines: true,
      scholarshipLinks: { include: { scholarship: true } },
    },
  });

  if (!university) {
    return NextResponse.json({ error: 'University not found' }, { status: 404 });
  }
  return NextResponse.json({ university });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAuth('universities:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;
  const { id } = await context.params;

  try {
    const existing = await prisma.university.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    const body = await req.json();

    // If changing publication status to PUBLISHED, validate required fields & permissions
    if (body.status === 'PUBLISHED') {
      if (!hasPermission(actor, 'universities:publish')) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to publish universities directly.' },
          { status: 403 }
        );
      }
      const targetName = body.nameEn ?? existing.nameEn;
      if (!targetName || targetName.trim().length < 2) {
        return NextResponse.json(
          { error: 'Cannot publish a university without a valid English name.' },
          { status: 400 }
        );
      }
    }

    const newSlug = body.slug
      ? String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : existing.slug;

    const updated = await prisma.$transaction(async (tx) => {
      if (newSlug !== existing.slug) {
        await tx.universitySlugRedirect.upsert({
          where: { oldSlug: existing.slug },
          update: { universityId: existing.id },
          create: { oldSlug: existing.slug, universityId: existing.id },
        });
      }

      return tx.university.update({
        where: { id },
        data: {
          slug: newSlug,
          nameEn: body.nameEn ?? existing.nameEn,
          nameAr: body.nameAr !== undefined ? body.nameAr : existing.nameAr,
          nameZh: body.nameZh !== undefined ? body.nameZh : existing.nameZh,
          logoUrl: body.logoUrl !== undefined ? body.logoUrl : existing.logoUrl,
          shortDescriptionEn:
            body.shortDescriptionEn !== undefined ? body.shortDescriptionEn : existing.shortDescriptionEn,
          shortDescriptionAr:
            body.shortDescriptionAr !== undefined ? body.shortDescriptionAr : existing.shortDescriptionAr,
          detailedDescriptionEn:
            body.detailedDescriptionEn !== undefined
              ? body.detailedDescriptionEn
              : existing.detailedDescriptionEn,
          detailedDescriptionAr:
            body.detailedDescriptionAr !== undefined
              ? body.detailedDescriptionAr
              : existing.detailedDescriptionAr,
          universityType: body.universityType !== undefined ? body.universityType : existing.universityType,
          country: body.country !== undefined ? body.country : existing.country,
          province: body.province !== undefined ? body.province : existing.province,
          city: body.city !== undefined ? body.city : existing.city,
          district: body.district !== undefined ? body.district : existing.district,
          address: body.address !== undefined ? body.address : existing.address,
          latitude: body.latitude !== undefined ? body.latitude : existing.latitude,
          longitude: body.longitude !== undefined ? body.longitude : existing.longitude,
          mapUrl: body.mapUrl !== undefined ? body.mapUrl : existing.mapUrl,
          officialWebsite: body.officialWebsite !== undefined ? body.officialWebsite : existing.officialWebsite,
          officialAdmissionsUrl:
            body.officialAdmissionsUrl !== undefined
              ? body.officialAdmissionsUrl
              : existing.officialAdmissionsUrl,
          officialContact: body.officialContact !== undefined ? body.officialContact : existing.officialContact,
          accreditationInfoEn:
            body.accreditationInfoEn !== undefined ? body.accreditationInfoEn : existing.accreditationInfoEn,
          accreditationInfoAr:
            body.accreditationInfoAr !== undefined ? body.accreditationInfoAr : existing.accreditationInfoAr,
          recognitionInfoEn:
            body.recognitionInfoEn !== undefined ? body.recognitionInfoEn : existing.recognitionInfoEn,
          recognitionInfoAr:
            body.recognitionInfoAr !== undefined ? body.recognitionInfoAr : existing.recognitionInfoAr,
          rankingInfoEn: body.rankingInfoEn !== undefined ? body.rankingInfoEn : existing.rankingInfoEn,
          rankingInfoAr: body.rankingInfoAr !== undefined ? body.rankingInfoAr : existing.rankingInfoAr,
          accommodationAvailable:
            body.accommodationAvailable !== undefined
              ? body.accommodationAvailable
              : existing.accommodationAvailable,
          accommodationDescEn:
            body.accommodationDescEn !== undefined ? body.accommodationDescEn : existing.accommodationDescEn,
          accommodationDescAr:
            body.accommodationDescAr !== undefined ? body.accommodationDescAr : existing.accommodationDescAr,
          whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : existing.whatsappNumber,
          internalNotes: body.internalNotes !== undefined ? body.internalNotes : existing.internalNotes,
          isFeatured: body.isFeatured !== undefined ? body.isFeatured : existing.isFeatured,
          acceptingApplications:
            body.acceptingApplications !== undefined
              ? body.acceptingApplications
              : existing.acceptingApplications,
          status: body.status ?? existing.status,
          sourceUrl: body.sourceUrl !== undefined ? body.sourceUrl : existing.sourceUrl,
          seoTitleEn: body.seoTitleEn !== undefined ? body.seoTitleEn : existing.seoTitleEn,
          seoTitleAr: body.seoTitleAr !== undefined ? body.seoTitleAr : existing.seoTitleAr,
          seoDescriptionEn:
            body.seoDescriptionEn !== undefined ? body.seoDescriptionEn : existing.seoDescriptionEn,
          seoDescriptionAr:
            body.seoDescriptionAr !== undefined ? body.seoDescriptionAr : existing.seoDescriptionAr,
          canonicalUrl: body.canonicalUrl !== undefined ? body.canonicalUrl : existing.canonicalUrl,
          noIndex: body.noIndex !== undefined ? body.noIndex : existing.noIndex,
        },
      });
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'UNIVERSITY_UPDATED',
      entityType: 'University',
      entityId: updated.id,
      summary: `Updated university ${updated.nameEn} (status: ${updated.status})`,
    });

    return NextResponse.json({ university: updated });
  } catch (err: any) {
    console.error('Update university error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update university' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAuth('universities:delete');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;
  const { id } = await context.params;

  // Require confirmation flag for destructive operation per Section 18 & 19
  const confirm = req.nextUrl.searchParams.get('confirm') === 'true';
  if (!confirm) {
    return NextResponse.json(
      { error: 'Destructive operation requires explicit confirmation (?confirm=true).' },
      { status: 400 }
    );
  }

  const existing = await prisma.university.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'University not found' }, { status: 404 });
  }

  // Delete university assignments without deleting GlobalRequirement or Scholarship records
  await prisma.university.delete({ where: { id } });

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'UNIVERSITY_DELETED',
    entityType: 'University',
    entityId: id,
    summary: `Deleted university ${existing.nameEn}`,
  });

  return NextResponse.json({ ok: true });
}
