import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { evaluateDeadline } from '@/lib/deadlines';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth('deadlines:read');
  if (auth.errorResponse) return auth.errorResponse;

  const withinDays = req.nextUrl.searchParams.get('withinDays')
    ? Number(req.nextUrl.searchParams.get('withinDays'))
    : undefined;

  const sys = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
  const warningDays = sys?.deadlineWarningDays ?? 30;

  const raw = await prisma.applicationDeadline.findMany({
    include: {
      university: { select: { id: true, nameEn: true, nameAr: true } },
      program: { select: { id: true, nameEn: true, nameAr: true } },
      scholarship: { select: { id: true, nameEn: true, nameAr: true } },
    },
    orderBy: { closingDate: 'asc' },
  });

  let deadlines = raw.map((d) => ({
    ...d,
    evaluated: evaluateDeadline(d, { warningDays }),
  }));

  if (typeof withinDays === 'number' && !Number.isNaN(withinDays)) {
    deadlines = deadlines.filter(
      (d) =>
        d.evaluated.daysRemaining !== null &&
        d.evaluated.daysRemaining >= 0 &&
        d.evaluated.daysRemaining <= withinDays
    );
  }

  return NextResponse.json({ deadlines, warningDays });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('deadlines:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();
    if (!body.titleEn || !body.academicYear) {
      return NextResponse.json({ error: 'titleEn and academicYear are required' }, { status: 400 });
    }

    const created = await prisma.applicationDeadline.create({
      data: {
        titleEn: body.titleEn,
        titleAr: body.titleAr || null,
        universityId: body.universityId || null,
        programId: body.programId || null,
        scholarshipId: body.scholarshipId || null,
        intakeNameEn: body.intakeNameEn || null,
        intakeNameAr: body.intakeNameAr || null,
        academicYear: body.academicYear,
        openingDate: body.openingDate ? new Date(body.openingDate) : null,
        closingDate: body.closingDate ? new Date(body.closingDate) : null,
        timezone: body.timezone || 'Asia/Shanghai',
        showNotAnnounced: Boolean(body.showNotAnnounced),
        expiredBehavior: body.expiredBehavior || 'KEEP_VISIBLE',
        sourceUrl: body.sourceUrl || null,
        verificationStatus: body.verificationStatus || 'PENDING_VERIFICATION',
        status: body.status || 'PUBLISHED',
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'DEADLINE_CREATED',
      entityType: 'ApplicationDeadline',
      entityId: created.id,
      summary: `Created deadline ${created.titleEn}`,
    });

    return NextResponse.json({ deadline: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create deadline' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('deadlines:write');
  if (auth.errorResponse) return auth.errorResponse;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'Deadline id required' }, { status: 400 });

  const updated = await prisma.applicationDeadline.update({
    where: { id: body.id },
    data: {
      titleEn: body.titleEn,
      titleAr: body.titleAr,
      openingDate: body.openingDate ? new Date(body.openingDate) : null,
      closingDate: body.closingDate ? new Date(body.closingDate) : null,
      showNotAnnounced: body.showNotAnnounced,
      expiredBehavior: body.expiredBehavior,
      sourceUrl: body.sourceUrl,
      verificationStatus: body.verificationStatus,
      status: body.status,
    },
  });

  return NextResponse.json({ deadline: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth('deadlines:write');
  if (auth.errorResponse) return auth.errorResponse;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Deadline id required' }, { status: 400 });

  await prisma.applicationDeadline.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
