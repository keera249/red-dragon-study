import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth('verification:read');
  if (auth.errorResponse) return auth.errorResponse;

  const statusFilter = req.nextUrl.searchParams.get('status') || undefined;
  const records = await prisma.verificationRecord.findMany({
    where: statusFilter && statusFilter !== 'ALL' ? { status: statusFilter } : undefined,
    include: {
      verifiedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ records });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('verification:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();
    if (!body.entityType || !body.entityId || !body.entityTitle) {
      return NextResponse.json(
        { error: 'entityType, entityId, and entityTitle are required' },
        { status: 400 }
      );
    }

    const record = await prisma.verificationRecord.create({
      data: {
        entityType: body.entityType,
        entityId: body.entityId,
        entityTitle: body.entityTitle,
        status: body.status || 'PENDING_VERIFICATION',
        sourceUrl: body.sourceUrl || null,
        sourceType: body.sourceType || 'OFFICIAL_WEBSITE',
        lastVerifiedDate: body.status === 'VERIFIED' ? new Date() : null,
        verifiedById: body.status === 'VERIFIED' ? actor.id : null,
        internalNotes: body.internalNotes || null,
        nextReviewDate: body.nextReviewDate ? new Date(body.nextReviewDate) : null,
        academicYear: body.academicYear || '2027-2028',
        showPublicIndicator: body.showPublicIndicator !== false,
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'VERIFICATION_RECORD_CREATED',
      entityType: 'VerificationRecord',
      entityId: record.id,
      summary: `Created verification record for ${record.entityTitle} (${record.status})`,
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create verification record' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('verification:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'Verification record id required' }, { status: 400 });

  const existing = await prisma.verificationRecord.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Retain previous values snapshot so employees can review previous state (Section 15)
  const previousSnapshot = {
    status: existing.status,
    sourceUrl: existing.sourceUrl,
    lastVerifiedDate: existing.lastVerifiedDate,
    academicYear: existing.academicYear,
    updatedAt: existing.updatedAt,
  };

  const updated = await prisma.verificationRecord.update({
    where: { id: body.id },
    data: {
      status: body.status ?? existing.status,
      sourceUrl: body.sourceUrl !== undefined ? body.sourceUrl : existing.sourceUrl,
      sourceType: body.sourceType !== undefined ? body.sourceType : existing.sourceType,
      lastVerifiedDate:
        body.status === 'VERIFIED' ? new Date() : existing.lastVerifiedDate,
      verifiedById: body.status === 'VERIFIED' ? actor.id : existing.verifiedById,
      internalNotes: body.internalNotes !== undefined ? body.internalNotes : existing.internalNotes,
      nextReviewDate: body.nextReviewDate ? new Date(body.nextReviewDate) : existing.nextReviewDate,
      academicYear: body.academicYear ?? existing.academicYear,
      showPublicIndicator:
        body.showPublicIndicator !== undefined ? body.showPublicIndicator : existing.showPublicIndicator,
      previousValuesJson: JSON.stringify(previousSnapshot),
    },
  });

  // Also sync verificationStatus to the parent University if entityType === 'UNIVERSITY'
  if (existing.entityType === 'UNIVERSITY' && body.status) {
    await prisma.university
      .update({
        where: { id: existing.entityId },
        data: {
          verificationStatus: body.status,
          lastVerifiedAt: body.status === 'VERIFIED' ? new Date() : undefined,
        },
      })
      .catch(() => {});
  }

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'VERIFICATION_RECORD_UPDATED',
    entityType: 'VerificationRecord',
    entityId: updated.id,
    summary: `Updated verification status of ${updated.entityTitle} to ${updated.status}`,
  });

  return NextResponse.json({ record: updated });
}
