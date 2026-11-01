import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { recordAuditLog } from '@/lib/audit';

export async function GET() {
  const auth = await requireApiAuth('scholarships:read');
  if (auth.errorResponse) return auth.errorResponse;

  const scholarships = await prisma.scholarship.findMany({
    where: { status: { not: 'DELETED' } },
    include: {
      universityLinks: { include: { university: { select: { id: true, nameEn: true, nameAr: true, slug: true } } } },
      programLinks: { include: { program: { select: { id: true, nameEn: true, nameAr: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ scholarships });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('scholarships:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();
    if (!body.nameEn || !body.fundingType) {
      return NextResponse.json({ error: 'nameEn and fundingType are required' }, { status: 400 });
    }

    const slug = (
      body.slug ||
      body.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    ).concat(`-${Date.now().toString().slice(-3)}`);

    const universityIds: string[] = Array.isArray(body.universityIds) ? body.universityIds : [];

    const scholarship = await prisma.$transaction(async (tx) => {
      const created = await tx.scholarship.create({
        data: {
          slug,
          nameEn: body.nameEn,
          nameAr: body.nameAr || null,
          providerEn: body.providerEn || null,
          providerAr: body.providerAr || null,
          category: body.category || 'GOVERNMENT',
          fundingType: body.fundingType,
          tuitionCoverageEn: body.tuitionCoverageEn || null,
          tuitionCoverageAr: body.tuitionCoverageAr || null,
          accommodationCoverageEn: body.accommodationCoverageEn || null,
          accommodationCoverageAr: body.accommodationCoverageAr || null,
          stipendAmount:
            body.stipendAmount !== undefined && body.stipendAmount !== null && body.stipendAmount !== ''
              ? Number(body.stipendAmount)
              : null,
          stipendCurrency: body.stipendCurrency || 'CNY',
          stipendPeriod: body.stipendPeriod || 'MONTHLY',
          otherBenefitsEn: body.otherBenefitsEn || null,
          otherBenefitsAr: body.otherBenefitsAr || null,
          eligibilityEn: body.eligibilityEn || null,
          eligibilityAr: body.eligibilityAr || null,
          eligibleNationalities: body.eligibleNationalities || null,
          degreeLevelsJson: Array.isArray(body.degreeLevels)
            ? JSON.stringify(body.degreeLevels)
            : body.degreeLevelsJson || null,
          languageRequirementsEn: body.languageRequirementsEn || null,
          languageRequirementsAr: body.languageRequirementsAr || null,
          requiredDocumentsEn: body.requiredDocumentsEn || null,
          requiredDocumentsAr: body.requiredDocumentsAr || null,
          openingDate: body.openingDate ? new Date(body.openingDate) : null,
          deadlineDate: body.deadlineDate ? new Date(body.deadlineDate) : null,
          durationEn: body.durationEn || null,
          durationAr: body.durationAr || null,
          renewalConditionsEn: body.renewalConditionsEn || null,
          renewalConditionsAr: body.renewalConditionsAr || null,
          officialUrl: body.officialUrl || null,
          applicationInstructionsEn: body.applicationInstructionsEn || null,
          applicationInstructionsAr: body.applicationInstructionsAr || null,
          additionalNotesEn: body.additionalNotesEn || null,
          additionalNotesAr: body.additionalNotesAr || null,
          internalNotes: body.internalNotes || null,
          isFeatured: Boolean(body.isFeatured),
          status: body.status || 'PUBLISHED',
          verificationStatus: 'PENDING_VERIFICATION',
          sourceUrl: body.sourceUrl || null,
        },
      });

      for (const uniId of universityIds) {
        await tx.scholarshipUniversity.create({
          data: { scholarshipId: created.id, universityId: uniId },
        });
      }

      return created;
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'SCHOLARSHIP_CREATED',
      entityType: 'Scholarship',
      entityId: scholarship.id,
      summary: `Created scholarship ${scholarship.nameEn}`,
    });

    return NextResponse.json({ scholarship }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create scholarship' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('scholarships:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Scholarship id required' }, { status: 400 });

    const updated = await prisma.$transaction(async (tx) => {
      const sch = await tx.scholarship.update({
        where: { id: body.id },
        data: {
          nameEn: body.nameEn,
          nameAr: body.nameAr,
          providerEn: body.providerEn,
          providerAr: body.providerAr,
          category: body.category,
          fundingType: body.fundingType,
          tuitionCoverageEn: body.tuitionCoverageEn,
          tuitionCoverageAr: body.tuitionCoverageAr,
          accommodationCoverageEn: body.accommodationCoverageEn,
          accommodationCoverageAr: body.accommodationCoverageAr,
          stipendAmount:
            body.stipendAmount !== undefined && body.stipendAmount !== null && body.stipendAmount !== ''
              ? Number(body.stipendAmount)
              : null,
          otherBenefitsEn: body.otherBenefitsEn,
          otherBenefitsAr: body.otherBenefitsAr,
          eligibilityEn: body.eligibilityEn,
          eligibilityAr: body.eligibilityAr,
          openingDate: body.openingDate ? new Date(body.openingDate) : null,
          deadlineDate: body.deadlineDate ? new Date(body.deadlineDate) : null,
          durationEn: body.durationEn,
          durationAr: body.durationAr,
          renewalConditionsEn: body.renewalConditionsEn,
          renewalConditionsAr: body.renewalConditionsAr,
          officialUrl: body.officialUrl,
          internalNotes: body.internalNotes,
          isFeatured: body.isFeatured,
          status: body.status,
          sourceUrl: body.sourceUrl,
        },
      });

      if (Array.isArray(body.universityIds)) {
        await tx.scholarshipUniversity.deleteMany({ where: { scholarshipId: sch.id } });
        for (const uniId of body.universityIds) {
          await tx.scholarshipUniversity.create({
            data: { scholarshipId: sch.id, universityId: uniId },
          });
        }
      }

      return sch;
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'SCHOLARSHIP_UPDATED',
      entityType: 'Scholarship',
      entityId: updated.id,
      summary: `Updated scholarship ${updated.nameEn}`,
    });

    return NextResponse.json({ scholarship: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update scholarship' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth('scholarships:delete');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  const id = req.nextUrl.searchParams.get('id');
  const confirm = req.nextUrl.searchParams.get('confirm') === 'true';
  if (!id || !confirm) {
    return NextResponse.json(
      { error: 'Scholarship id and confirm=true are required.' },
      { status: 400 }
    );
  }

  if (!hasPermission(actor, 'scholarships:delete')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.scholarship.delete({ where: { id } });

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'SCHOLARSHIP_DELETED',
    entityType: 'Scholarship',
    entityId: id,
    summary: `Deleted scholarship ${id}`,
  });

  return NextResponse.json({ ok: true });
}
