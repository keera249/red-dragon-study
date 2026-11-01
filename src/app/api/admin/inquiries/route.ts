import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { canAccessInquiryRecord, hasAnyPermission, hasPermission } from '@/lib/rbac';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth();
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  if (!hasAnyPermission(actor, ['inquiries:read_all', 'inquiries:read_assigned'])) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to access student inquiries.' },
      { status: 403 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const statusFilter = sp.get('status') || undefined;
  const universityId = sp.get('universityId') || undefined;
  const q = sp.get('q')?.trim().toLowerCase() || undefined;
  const exportFormat = sp.get('export') || undefined;

  const canReadAll = hasPermission(actor, 'inquiries:read_all');

  const inquiries = await prisma.studentInquiry.findMany({
    where: {
      isDeleted: false,
      ...(canReadAll ? {} : { assignedEmployeeId: actor.id }),
      ...(statusFilter && statusFilter !== 'ALL' ? { statusCode: statusFilter } : {}),
      ...(universityId && universityId !== 'ALL' ? { universityId } : {}),
    },
    include: {
      university: { select: { id: true, nameEn: true, nameAr: true } },
      program: { select: { id: true, nameEn: true, nameAr: true } },
      scholarship: { select: { id: true, nameEn: true, nameAr: true } },
      assignedEmployee: { select: { id: true, name: true, email: true } },
      notes: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
      statusHistory: {
        include: { changedBy: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
      followUpReminders: {
        include: { employee: { select: { id: true, name: true } } },
        orderBy: { dueAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const filtered = q
    ? inquiries.filter(
        (i) =>
          i.studentName.toLowerCase().includes(q) ||
          i.inquiryNumber.toLowerCase().includes(q) ||
          (i.email && i.email.toLowerCase().includes(q)) ||
          (i.whatsappNumber && i.whatsappNumber.toLowerCase().includes(q)) ||
          i.message.toLowerCase().includes(q)
      )
    : inquiries;

  if (exportFormat === 'csv') {
    if (!hasPermission(actor, 'inquiries:export')) {
      return NextResponse.json(
        { error: 'Forbidden: Missing inquiries:export permission' },
        { status: 403 }
      );
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'INQUIRIES_EXPORTED',
      entityType: 'StudentInquiry',
      summary: `Exported ${filtered.length} inquiry records to CSV`,
    });

    const headers = [
      'Inquiry Number',
      'Student Name',
      'Email',
      'WhatsApp',
      'Country',
      'University',
      'Status',
      'Assigned Employee',
      'Created At',
    ];
    const rows = filtered.map((i) => [
      i.inquiryNumber,
      `"${i.studentName.replace(/"/g, '""')}"`,
      i.email || '',
      i.whatsappNumber || '',
      i.countryOfResidence || '',
      `"${(i.university?.nameEn || '').replace(/"/g, '""')}"`,
      i.statusCode,
      `"${(i.assignedEmployee?.name || '').replace(/"/g, '""')}"`,
      i.createdAt.toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="student-inquiries.csv"',
      },
    });
  }

  const [statuses, employees] = await Promise.all([
    prisma.inquiryStatusConfig.findMany({
      where: { isEnabled: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.adminUser.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return NextResponse.json({ inquiries: filtered, statuses, employees });
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('inquiries:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();
    const { inquiryId, action } = body;
    if (!inquiryId) {
      return NextResponse.json({ error: 'inquiryId is required' }, { status: 400 });
    }

    const existing = await prisma.studentInquiry.findUnique({ where: { id: inquiryId } });
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    if (!canAccessInquiryRecord(actor, existing)) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to access this inquiry record.' },
        { status: 403 }
      );
    }

    // 1. Update status (records InquiryStatusHistory automatically per Section 14.3)
    if (action === 'UPDATE_STATUS' && body.statusCode) {
      const updated = await prisma.$transaction(async (tx) => {
        const u = await tx.studentInquiry.update({
          where: { id: inquiryId },
          data: {
            statusCode: body.statusCode,
            lastFollowUpDate: new Date(),
          },
        });
        await tx.inquiryStatusHistory.create({
          data: {
            inquiryId,
            fromStatus: existing.statusCode,
            toStatus: body.statusCode,
            changedById: actor.id,
            note: body.note || `Status changed from ${existing.statusCode} to ${body.statusCode}`,
          },
        });
        return u;
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'INQUIRY_STATUS_UPDATED',
        entityType: 'StudentInquiry',
        entityId: inquiryId,
        summary: `Changed inquiry ${existing.inquiryNumber} status from ${existing.statusCode} to ${body.statusCode}`,
      });

      return NextResponse.json({ inquiry: updated });
    }

    // 2. Add internal note (never exposed on public pages!)
    if (action === 'ADD_NOTE' && body.noteText) {
      const note = await prisma.inquiryNote.create({
        data: {
          inquiryId,
          authorId: actor.id,
          noteText: String(body.noteText).trim(),
          isInternal: true,
        },
        include: { author: { select: { id: true, name: true, email: true } } },
      });

      await prisma.studentInquiry.update({
        where: { id: inquiryId },
        data: { lastFollowUpDate: new Date() },
      });

      return NextResponse.json({ note });
    }

    // 3. Assign inquiry to employee
    if (action === 'ASSIGN_EMPLOYEE') {
      if (!hasPermission(actor, 'inquiries:assign')) {
        return NextResponse.json(
          { error: 'Forbidden: Missing inquiries:assign permission' },
          { status: 403 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const u = await tx.studentInquiry.update({
          where: { id: inquiryId },
          data: { assignedEmployeeId: body.assignedToId || null },
        });
        if (body.assignedToId) {
          await tx.inquiryAssignment.create({
            data: {
              inquiryId,
              assignedToId: body.assignedToId,
              assignedById: actor.id,
              notes: body.notes || null,
            },
          });
        }
        return u;
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'INQUIRY_ASSIGNED',
        entityType: 'StudentInquiry',
        entityId: inquiryId,
        summary: `Assigned inquiry ${existing.inquiryNumber} to employee ${body.assignedToId || 'unassigned'}`,
      });

      return NextResponse.json({ inquiry: updated });
    }

    // 4. Add Follow-Up Reminder
    if (action === 'ADD_REMINDER' && body.dueAt && body.note) {
      const reminder = await prisma.followUpReminder.create({
        data: {
          inquiryId,
          employeeId: body.employeeId || actor.id,
          dueAt: new Date(body.dueAt),
          note: body.note,
        },
      });
      await prisma.studentInquiry.update({
        where: { id: inquiryId },
        data: { nextFollowUpDate: new Date(body.dueAt) },
      });
      return NextResponse.json({ reminder });
    }

    // 5. Complete Follow-Up Reminder
    if (action === 'COMPLETE_REMINDER' && body.reminderId) {
      const reminder = await prisma.followUpReminder.update({
        where: { id: body.reminderId },
        data: { isCompleted: true, completedAt: new Date() },
      });
      return NextResponse.json({ reminder });
    }

    return NextResponse.json({ error: 'Unknown inquiry action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Inquiry update failed' }, { status: 500 });
  }
}
