import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth('programs:read');
  if (auth.errorResponse) return auth.errorResponse;

  const universityId = req.nextUrl.searchParams.get('universityId') || undefined;
  const programs = await prisma.universityProgram.findMany({
    where: {
      ...(universityId ? { universityId } : {}),
      status: { not: 'DELETED' },
    },
    include: {
      university: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
      intakes: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ programs });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('programs:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();
    if (!body.universityId || !body.nameEn || !body.degreeLevel || !body.languageOfInstruction) {
      return NextResponse.json(
        { error: 'universityId, nameEn, degreeLevel, and languageOfInstruction are required.' },
        { status: 400 }
      );
    }

    const rawSlug =
      body.slug ||
      body.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const program = await prisma.universityProgram.create({
      data: {
        universityId: body.universityId,
        slug: `${rawSlug}-${Date.now().toString().slice(-4)}`,
        nameEn: body.nameEn,
        nameAr: body.nameAr || null,
        nameZh: body.nameZh || null,
        degreeLevel: body.degreeLevel,
        disciplineEn: body.disciplineEn || null,
        disciplineAr: body.disciplineAr || null,
        languageOfInstruction: body.languageOfInstruction,
        durationEn: body.durationEn || null,
        durationAr: body.durationAr || null,
        intakePeriodsEn: body.intakePeriodsEn || null,
        intakePeriodsAr: body.intakePeriodsAr || null,
        tuitionAmount: body.tuitionAmount !== undefined && body.tuitionAmount !== '' ? Number(body.tuitionAmount) : null,
        tuitionCurrency: body.tuitionCurrency || 'CNY',
        tuitionPeriod: body.tuitionPeriod || 'ANNUALLY',
        applicationFeeAmount:
          body.applicationFeeAmount !== undefined && body.applicationFeeAmount !== ''
            ? Number(body.applicationFeeAmount)
            : null,
        applicationFeeCurrency: body.applicationFeeCurrency || 'CNY',
        eligibilityEn: body.eligibilityEn || null,
        eligibilityAr: body.eligibilityAr || null,
        languageReqEn: body.languageReqEn || null,
        languageReqAr: body.languageReqAr || null,
        academicReqEn: body.academicReqEn || null,
        academicReqAr: body.academicReqAr || null,
        entranceExamsEn: body.entranceExamsEn || null,
        entranceExamsAr: body.entranceExamsAr || null,
        openingDate: body.openingDate ? new Date(body.openingDate) : null,
        deadlineDate: body.deadlineDate ? new Date(body.deadlineDate) : null,
        officialProgramUrl: body.officialProgramUrl || null,
        additionalNotesEn: body.additionalNotesEn || null,
        additionalNotesAr: body.additionalNotesAr || null,
        internalNotes: body.internalNotes || null,
        status: body.status || 'PUBLISHED',
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'PROGRAM_CREATED',
      entityType: 'UniversityProgram',
      entityId: program.id,
      summary: `Created program ${program.nameEn}`,
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create program' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('programs:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Program id is required' }, { status: 400 });
    }

    const updated = await prisma.universityProgram.update({
      where: { id: body.id },
      data: {
        nameEn: body.nameEn,
        nameAr: body.nameAr,
        nameZh: body.nameZh,
        degreeLevel: body.degreeLevel,
        disciplineEn: body.disciplineEn,
        disciplineAr: body.disciplineAr,
        languageOfInstruction: body.languageOfInstruction,
        durationEn: body.durationEn,
        durationAr: body.durationAr,
        intakePeriodsEn: body.intakePeriodsEn,
        intakePeriodsAr: body.intakePeriodsAr,
        tuitionAmount:
          body.tuitionAmount !== undefined && body.tuitionAmount !== null && body.tuitionAmount !== ''
            ? Number(body.tuitionAmount)
            : null,
        tuitionCurrency: body.tuitionCurrency,
        tuitionPeriod: body.tuitionPeriod,
        applicationFeeAmount:
          body.applicationFeeAmount !== undefined &&
          body.applicationFeeAmount !== null &&
          body.applicationFeeAmount !== ''
            ? Number(body.applicationFeeAmount)
            : null,
        eligibilityEn: body.eligibilityEn,
        eligibilityAr: body.eligibilityAr,
        languageReqEn: body.languageReqEn,
        languageReqAr: body.languageReqAr,
        openingDate: body.openingDate ? new Date(body.openingDate) : null,
        deadlineDate: body.deadlineDate ? new Date(body.deadlineDate) : null,
        officialProgramUrl: body.officialProgramUrl,
        internalNotes: body.internalNotes,
        status: body.status,
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'PROGRAM_UPDATED',
      entityType: 'UniversityProgram',
      entityId: updated.id,
      summary: `Updated program ${updated.nameEn}`,
    });

    return NextResponse.json({ program: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update program' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth('programs:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Program id is required' }, { status: 400 });

  await prisma.universityProgram.delete({ where: { id } });

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'PROGRAM_DELETED',
    entityType: 'UniversityProgram',
    entityId: id,
    summary: `Deleted program ${id}`,
  });

  return NextResponse.json({ ok: true });
}
