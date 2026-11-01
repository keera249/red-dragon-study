import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth('requirements:read');
  if (auth.errorResponse) return auth.errorResponse;

  const universityId = req.nextUrl.searchParams.get('universityId') || undefined;

  const [globalRequirements, universityAssignments, specificRequirements] = await Promise.all([
    prisma.globalRequirement.findMany({
      where: { status: { not: 'DELETED' } },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.universityRequirement.findMany({
      where: universityId ? { universityId } : undefined,
      include: {
        university: { select: { id: true, nameEn: true, nameAr: true } },
        requirement: true,
        override: true,
      },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.universitySpecificRequirement.findMany({
      where: universityId ? { universityId } : undefined,
      include: {
        university: { select: { id: true, nameEn: true, nameAr: true } },
      },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  return NextResponse.json({
    globalRequirements,
    universityAssignments,
    specificRequirements,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('requirements:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();

    // 1. Create Global Shared Requirement
    if (body.type === 'GLOBAL') {
      const code = (
        body.code ||
        body.nameEn
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '_')
      ).concat(`_${Date.now().toString().slice(-3)}`);

      const created = await prisma.globalRequirement.create({
        data: {
          code,
          nameEn: body.nameEn,
          nameAr: body.nameAr || null,
          descriptionEn: body.descriptionEn || null,
          descriptionAr: body.descriptionAr || null,
          instructionsEn: body.instructionsEn || null,
          instructionsAr: body.instructionsAr || null,
          supportingDocUrl: body.supportingDocUrl || null,
          isRequiredDefault: body.isRequiredDefault !== false,
          displayOrder: Number(body.displayOrder || 10),
          isEnabled: body.isEnabled !== false,
          status: body.status || 'PUBLISHED',
        },
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'GLOBAL_REQUIREMENT_CREATED',
        entityType: 'GlobalRequirement',
        entityId: created.id,
        summary: `Created shared requirement ${created.nameEn}`,
      });

      return NextResponse.json({ requirement: created }, { status: 201 });
    }

    // 2. Bulk Assign Shared Requirements to a University
    if (body.type === 'ASSIGN_TO_UNIVERSITY') {
      const { universityId, requirementIds } = body;
      if (!universityId || !Array.isArray(requirementIds)) {
        return NextResponse.json(
          { error: 'universityId and requirementIds array are required.' },
          { status: 400 }
        );
      }

      const assigned = [];
      for (const [idx, reqId] of requirementIds.entries()) {
        const upserted = await prisma.universityRequirement.upsert({
          where: { universityId_requirementId: { universityId, requirementId: reqId } },
          update: { isEnabled: true, status: 'PUBLISHED' },
          create: {
            universityId,
            requirementId: reqId,
            displayOrder: idx + 1,
            isEnabled: true,
            status: 'PUBLISHED',
          },
        });
        assigned.push(upserted);
      }

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'UNIVERSITY_REQUIREMENTS_ASSIGNED',
        entityType: 'University',
        entityId: universityId,
        summary: `Assigned ${assigned.length} shared requirements to university ${universityId}`,
      });

      return NextResponse.json({ assigned }, { status: 201 });
    }

    // 3. Configure Per-University Override (Strictly isolated to that university!)
    if (body.type === 'OVERRIDE') {
      const { universityRequirementId } = body;
      if (!universityRequirementId) {
        return NextResponse.json({ error: 'universityRequirementId is required' }, { status: 400 });
      }

      const override = await prisma.requirementOverride.upsert({
        where: { universityRequirementId },
        update: {
          isRequiredOverride:
            typeof body.isRequiredOverride === 'boolean' ? body.isRequiredOverride : null,
          customNameEn: body.customNameEn || null,
          customNameAr: body.customNameAr || null,
          customDescriptionEn: body.customDescriptionEn || null,
          customDescriptionAr: body.customDescriptionAr || null,
          customInstructionsEn: body.customInstructionsEn || null,
          customInstructionsAr: body.customInstructionsAr || null,
          customSupportingDocUrl: body.customSupportingDocUrl || null,
          isExcluded: Boolean(body.isExcluded),
        },
        create: {
          universityRequirementId,
          isRequiredOverride:
            typeof body.isRequiredOverride === 'boolean' ? body.isRequiredOverride : null,
          customNameEn: body.customNameEn || null,
          customNameAr: body.customNameAr || null,
          customDescriptionEn: body.customDescriptionEn || null,
          customDescriptionAr: body.customDescriptionAr || null,
          customInstructionsEn: body.customInstructionsEn || null,
          customInstructionsAr: body.customInstructionsAr || null,
          customSupportingDocUrl: body.customSupportingDocUrl || null,
          isExcluded: Boolean(body.isExcluded),
        },
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'REQUIREMENT_OVERRIDE_UPDATED',
        entityType: 'RequirementOverride',
        entityId: override.id,
        summary: `Updated per-university requirement override for assignment ${universityRequirementId}`,
      });

      return NextResponse.json({ override }, { status: 201 });
    }

    // 4. Create University-Specific Requirement
    if (body.type === 'UNIVERSITY_SPECIFIC') {
      if (!body.universityId || !body.nameEn) {
        return NextResponse.json(
          { error: 'universityId and nameEn are required for university-specific requirement' },
          { status: 400 }
        );
      }

      const specific = await prisma.universitySpecificRequirement.create({
        data: {
          universityId: body.universityId,
          programId: body.programId || null,
          nameEn: body.nameEn,
          nameAr: body.nameAr || null,
          descriptionEn: body.descriptionEn || null,
          descriptionAr: body.descriptionAr || null,
          instructionsEn: body.instructionsEn || null,
          instructionsAr: body.instructionsAr || null,
          supportingDocUrl: body.supportingDocUrl || null,
          isRequired: body.isRequired !== false,
          displayOrder: Number(body.displayOrder || 20),
          isEnabled: body.isEnabled !== false,
          status: body.status || 'PUBLISHED',
        },
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'SPECIFIC_REQUIREMENT_CREATED',
        entityType: 'UniversitySpecificRequirement',
        entityId: specific.id,
        summary: `Created university-specific requirement ${specific.nameEn}`,
      });

      return NextResponse.json({ specificRequirement: specific }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid requirement operation type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed requirement operation' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('requirements:write');
  if (auth.errorResponse) return auth.errorResponse;

  const body = await req.json();
  if (body.type === 'GLOBAL' && body.id) {
    const updated = await prisma.globalRequirement.update({
      where: { id: body.id },
      data: {
        nameEn: body.nameEn,
        nameAr: body.nameAr,
        descriptionEn: body.descriptionEn,
        descriptionAr: body.descriptionAr,
        instructionsEn: body.instructionsEn,
        instructionsAr: body.instructionsAr,
        isRequiredDefault: body.isRequiredDefault,
        isEnabled: body.isEnabled,
        status: body.status,
      },
    });
    return NextResponse.json({ requirement: updated });
  }

  return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth('requirements:write');
  if (auth.errorResponse) return auth.errorResponse;

  const targetType = req.nextUrl.searchParams.get('type');
  const id = req.nextUrl.searchParams.get('id');
  if (!id || !targetType) {
    return NextResponse.json({ error: 'type and id are required' }, { status: 400 });
  }

  // Deleting an assignment must NOT delete the shared requirement itself (Rule 8.3)!
  if (targetType === 'ASSIGNMENT') {
    await prisma.universityRequirement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (targetType === 'SPECIFIC') {
    await prisma.universitySpecificRequirement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (targetType === 'GLOBAL') {
    await prisma.globalRequirement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown delete type' }, { status: 400 });
}
