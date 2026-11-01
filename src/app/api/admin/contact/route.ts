import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET() {
  const auth = await requireApiAuth('contact:manage');
  if (auth.errorResponse) return auth.errorResponse;

  const [contactSetting, templates] = await Promise.all([
    prisma.contactSetting.findUnique({ where: { id: 'default' } }),
    prisma.whatsAppTemplate.findMany({
      include: {
        university: { select: { id: true, nameEn: true, nameAr: true } },
        program: { select: { id: true, nameEn: true } },
        scholarship: { select: { id: true, nameEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ contactSetting, templates });
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('contact:manage');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();

    if (body.type === 'TEMPLATE' && body.id) {
      const updated = await prisma.whatsAppTemplate.update({
        where: { id: body.id },
        data: {
          name: body.name,
          scope: body.scope,
          universityId: body.universityId || null,
          programId: body.programId || null,
          scholarshipId: body.scholarshipId || null,
          whatsappNumberOverride: body.whatsappNumberOverride || null,
          templateEn: body.templateEn,
          templateAr: body.templateAr || null,
          isEnabled: body.isEnabled !== false,
        },
      });
      return NextResponse.json({ template: updated });
    }

    const updated = await prisma.contactSetting.upsert({
      where: { id: 'default' },
      update: {
        defaultWhatsappNumber: body.defaultWhatsappNumber,
        globalWhatsappEnabled: body.globalWhatsappEnabled,
        buttonTextEn: body.buttonTextEn,
        buttonTextAr: body.buttonTextAr,
        buttonPlacement: body.buttonPlacement,
        defaultMessageEn: body.defaultMessageEn,
        defaultMessageAr: body.defaultMessageAr,
        contactEmail: body.contactEmail,
        phoneDisplay: body.phoneDisplay,
        addressEn: body.addressEn,
        addressAr: body.addressAr,
        workingHoursEn: body.workingHoursEn,
        workingHoursAr: body.workingHoursAr,
        socialLinksJson: body.socialLinksJson,
        inquiryFieldsConfigJson: body.inquiryFieldsConfigJson,
        comparisonFieldsConfigJson: body.comparisonFieldsConfigJson,
      },
      create: {
        id: 'default',
        defaultWhatsappNumber: body.defaultWhatsappNumber,
        globalWhatsappEnabled: body.globalWhatsappEnabled ?? true,
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'CONTACT_SETTINGS_UPDATED',
      entityType: 'ContactSetting',
      entityId: 'default',
      summary: `Updated WhatsApp & contact configuration (enabled: ${updated.globalWhatsappEnabled})`,
    });

    return NextResponse.json({ contactSetting: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update contact settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('contact:manage');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  const body = await req.json();
  if (!body.name || !body.templateEn) {
    return NextResponse.json({ error: 'name and templateEn are required' }, { status: 400 });
  }

  const created = await prisma.whatsAppTemplate.create({
    data: {
      name: body.name,
      scope: body.scope || 'GLOBAL',
      universityId: body.universityId || null,
      programId: body.programId || null,
      scholarshipId: body.scholarshipId || null,
      whatsappNumberOverride: body.whatsappNumberOverride || null,
      templateEn: body.templateEn,
      templateAr: body.templateAr || null,
      isEnabled: body.isEnabled !== false,
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'WHATSAPP_TEMPLATE_CREATED',
    entityType: 'WhatsAppTemplate',
    entityId: created.id,
    summary: `Created WhatsApp template ${created.name} (${created.scope})`,
  });

  return NextResponse.json({ template: created }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth('contact:manage');
  if (auth.errorResponse) return auth.errorResponse;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Template id required' }, { status: 400 });

  await prisma.whatsAppTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
