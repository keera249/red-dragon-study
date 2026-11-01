import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth('settings:manage');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  if (req.nextUrl.searchParams.get('backup') === 'json') {
    const [
      systemSetting,
      contactSetting,
      universities,
      programs,
      fees,
      scholarships,
      globalRequirements,
      deadlines,
      pages,
      faqs,
    ] = await Promise.all([
      prisma.systemSetting.findMany(),
      prisma.contactSetting.findMany(),
      prisma.university.findMany(),
      prisma.universityProgram.findMany(),
      prisma.universityFee.findMany(),
      prisma.scholarship.findMany(),
      prisma.globalRequirement.findMany(),
      prisma.applicationDeadline.findMany(),
      prisma.websitePage.findMany(),
      prisma.faqItem.findMany(),
    ]);

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'DATABASE_BACKUP_EXPORTED',
      entityType: 'SystemSetting',
      summary: 'Exported JSON database backup snapshot',
    });

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      systemSetting,
      contactSetting,
      universities,
      programs,
      fees,
      scholarships,
      globalRequirements,
      deadlines,
      pages,
      faqs,
    });
  }

  const [systemSetting, auditLogs, inquiryStatuses] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.inquiryStatusConfig.findMany({ orderBy: { displayOrder: 'asc' } }),
  ]);

  return NextResponse.json({ systemSetting, auditLogs, inquiryStatuses });
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('settings:manage');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  const body = await req.json();

  if (body.type === 'INQUIRY_STATUS') {
    const statusCfg = await prisma.inquiryStatusConfig.upsert({
      where: { code: body.code },
      update: {
        labelEn: body.labelEn,
        labelAr: body.labelAr,
        displayOrder: Number(body.displayOrder || 1),
        isEnabled: body.isEnabled !== false,
      },
      create: {
        code: body.code,
        labelEn: body.labelEn,
        labelAr: body.labelAr || body.labelEn,
        displayOrder: Number(body.displayOrder || 10),
        isEnabled: true,
      },
    });
    return NextResponse.json({ statusConfig: statusCfg });
  }

  const updated = await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {
      siteNameEn: body.siteNameEn,
      siteNameAr: body.siteNameAr,
      defaultLanguage: body.defaultLanguage,
      timezone: body.timezone,
      defaultCurrency: body.defaultCurrency,
      itemsPerPage: body.itemsPerPage !== undefined ? Number(body.itemsPerPage) : undefined,
      deadlineWarningDays:
        body.deadlineWarningDays !== undefined ? Number(body.deadlineWarningDays) : undefined,
      maintenanceMode: body.maintenanceMode,
      privacyNoticeEn: body.privacyNoticeEn,
      privacyNoticeAr: body.privacyNoticeAr,
      retentionDays: body.retentionDays !== undefined ? Number(body.retentionDays) : undefined,
      seoDefaultTitleEn: body.seoDefaultTitleEn,
      seoDefaultTitleAr: body.seoDefaultTitleAr,
      seoDefaultDescEn: body.seoDefaultDescEn,
      seoDefaultDescAr: body.seoDefaultDescAr,
    },
    create: {
      id: 'default',
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'SYSTEM_SETTINGS_UPDATED',
    entityType: 'SystemSetting',
    entityId: 'default',
    summary: `Updated system settings (defaultLanguage: ${updated.defaultLanguage}, maintenanceMode: ${updated.maintenanceMode})`,
  });

  return NextResponse.json({ systemSetting: updated });
}
