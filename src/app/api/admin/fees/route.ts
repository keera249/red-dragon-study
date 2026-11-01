import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth('programs:read');
  if (auth.errorResponse) return auth.errorResponse;

  const universityId = req.nextUrl.searchParams.get('universityId') || undefined;
  const fees = await prisma.universityFee.findMany({
    where: universityId ? { universityId } : undefined,
    include: {
      university: { select: { id: true, nameEn: true, nameAr: true } },
      program: { select: { id: true, nameEn: true, nameAr: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ fees });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('programs:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();
    if (!body.universityId || !body.category || !body.titleEn || body.amount === undefined) {
      return NextResponse.json(
        { error: 'universityId, category, titleEn, and amount are required.' },
        { status: 400 }
      );
    }

    const fee = await prisma.universityFee.create({
      data: {
        universityId: body.universityId,
        programId: body.programId || null,
        category: body.category,
        titleEn: body.titleEn,
        titleAr: body.titleAr || null,
        amount: Number(body.amount),
        currency: body.currency || 'CNY',
        period: body.period || 'ANNUALLY',
        academicYear: body.academicYear || '2027-2028',
        isConfirmed: Boolean(body.isConfirmed),
        sourceUrl: body.sourceUrl || null,
        verifiedDate: body.verifiedDate ? new Date(body.verifiedDate) : null,
        notesEn: body.notesEn || null,
        notesAr: body.notesAr || null,
        status: body.status || 'PUBLISHED',
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'FEE_CREATED',
      entityType: 'UniversityFee',
      entityId: fee.id,
      summary: `Created fee ${fee.titleEn} (${fee.amount} ${fee.currency}/${fee.period})`,
    });

    return NextResponse.json({ fee }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create fee' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth('programs:write');
  if (auth.errorResponse) return auth.errorResponse;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Fee id required' }, { status: 400 });

  await prisma.universityFee.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
