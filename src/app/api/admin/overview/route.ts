import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { evaluateDeadline } from '@/lib/deadlines';
import { hasPermission } from '@/lib/rbac';

export async function GET() {
  const auth = await requireApiAuth();
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  const sys = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
  const warningDays = sys?.deadlineWarningDays ?? 30;

  const [
    totalUniversities,
    publishedUniversities,
    draftUniversities,
    activePrograms,
    activeScholarships,
    allDeadlines,
    newInquiries,
    inquiriesRequiringFollowUp,
    recordsRequiringVerification,
    recentUniversities,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.university.count({ where: { status: { not: 'DELETED' } } }),
    prisma.university.count({ where: { status: 'PUBLISHED' } }),
    prisma.university.count({ where: { status: 'DRAFT' } }),
    prisma.universityProgram.count({ where: { status: 'PUBLISHED' } }),
    prisma.scholarship.count({ where: { status: 'PUBLISHED' } }),
    prisma.applicationDeadline.findMany({
      where: { status: 'PUBLISHED' },
      include: { university: { select: { nameEn: true, slug: true } } },
    }),
    hasPermission(actor, 'inquiries:read_all')
      ? prisma.studentInquiry.count({ where: { statusCode: 'NEW_INQUIRY', isDeleted: false } })
      : prisma.studentInquiry.count({
          where: { statusCode: 'NEW_INQUIRY', assignedEmployeeId: actor.id, isDeleted: false },
        }),
    hasPermission(actor, 'inquiries:read_all')
      ? prisma.followUpReminder.count({ where: { isCompleted: false } })
      : prisma.followUpReminder.count({ where: { isCompleted: false, employeeId: actor.id } }),
    prisma.verificationRecord.count({
      where: { status: { in: ['PENDING_VERIFICATION', 'REQUIRES_REVIEW', 'OUTDATED'] } },
    }),
    prisma.university.findMany({
      where: { status: { not: 'DELETED' } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        status: true,
        verificationStatus: true,
        updatedAt: true,
      },
    }),
    hasPermission(actor, 'audit:read')
      ? prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 })
      : Promise.resolve([]),
  ]);

  let upcomingDeadlinesCount = 0;
  let expiredOpportunitiesCount = 0;
  const deadlineAlerts: any[] = [];

  for (const d of allDeadlines) {
    const ev = evaluateDeadline(d, { warningDays });
    if (ev.status === 'DEADLINE_APPROACHING') {
      upcomingDeadlinesCount += 1;
      deadlineAlerts.push({ ...d, evaluated: ev });
    } else if (ev.status === 'DEADLINE_PASSED') {
      expiredOpportunitiesCount += 1;
    }
  }

  return NextResponse.json({
    stats: {
      totalUniversities,
      publishedUniversities,
      draftUniversities,
      activePrograms,
      activeScholarships,
      upcomingDeadlines: upcomingDeadlinesCount,
      expiredOpportunities: expiredOpportunitiesCount,
      newInquiries,
      inquiriesRequiringFollowUp,
      recordsRequiringVerification,
    },
    deadlineAlerts,
    recentUniversities,
    recentAuditLogs,
  });
}
