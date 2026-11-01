import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET() {
  const auth = await requireApiAuth('content:read');
  if (auth.errorResponse) return auth.errorResponse;

  const [homepageSections, navigationItems, pages, faqs] = await Promise.all([
    prisma.homepageSection.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.navigationItem.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.websitePage.findMany({
      where: { status: { not: 'DELETED' } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.faqItem.findMany({ orderBy: { displayOrder: 'asc' } }),
  ]);

  return NextResponse.json({ homepageSections, navigationItems, pages, faqs });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('content:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();

    if (body.type === 'PAGE') {
      const slug = String(body.slug || body.titleEn)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '');

      const page = await prisma.websitePage.create({
        data: {
          slug,
          titleEn: body.titleEn,
          titleAr: body.titleAr || null,
          subtitleEn: body.subtitleEn || null,
          subtitleAr: body.subtitleAr || null,
          contentEn: body.contentEn || null,
          contentAr: body.contentAr || null,
          metaTitleEn: body.metaTitleEn || null,
          metaTitleAr: body.metaTitleAr || null,
          metaDescriptionEn: body.metaDescriptionEn || null,
          metaDescriptionAr: body.metaDescriptionAr || null,
          isSystemPage: false,
          isEnabled: body.isEnabled !== false,
          status: body.status || 'PUBLISHED',
        },
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'PAGE_CREATED',
        entityType: 'WebsitePage',
        entityId: page.id,
        summary: `Created custom page /${page.slug}`,
      });

      return NextResponse.json({ page }, { status: 201 });
    }

    if (body.type === 'NAV_ITEM') {
      const nav = await prisma.navigationItem.create({
        data: {
          labelEn: body.labelEn,
          labelAr: body.labelAr || body.labelEn,
          href: body.href,
          location: body.location || 'HEADER',
          displayOrder: Number(body.displayOrder || 10),
          isEnabled: body.isEnabled !== false,
        },
      });
      return NextResponse.json({ navigationItem: nav }, { status: 201 });
    }

    if (body.type === 'FAQ') {
      const faq = await prisma.faqItem.create({
        data: {
          questionEn: body.questionEn,
          questionAr: body.questionAr || null,
          answerEn: body.answerEn,
          answerAr: body.answerAr || null,
          category: body.category || 'GENERAL',
          displayOrder: Number(body.displayOrder || 10),
          isEnabled: body.isEnabled !== false,
          status: body.status || 'PUBLISHED',
        },
      });
      return NextResponse.json({ faq }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown content creation type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Content creation failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('content:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();

    if (body.type === 'HOMEPAGE_SECTION' && body.id) {
      const section = await prisma.homepageSection.update({
        where: { id: body.id },
        data: {
          titleEn: body.titleEn,
          titleAr: body.titleAr,
          subtitleEn: body.subtitleEn,
          subtitleAr: body.subtitleAr,
          descriptionEn: body.descriptionEn,
          descriptionAr: body.descriptionAr,
          buttonTextEn: body.buttonTextEn,
          buttonTextAr: body.buttonTextAr,
          buttonUrl: body.buttonUrl,
          imageUrl: body.imageUrl,
          displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
          isEnabled: body.isEnabled,
          status: body.status,
        },
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'HOMEPAGE_SECTION_UPDATED',
        entityType: 'HomepageSection',
        entityId: section.id,
        summary: `Updated homepage section ${section.sectionKey}`,
      });

      return NextResponse.json({ section });
    }

    if (body.type === 'NAV_ITEM' && body.id) {
      const nav = await prisma.navigationItem.update({
        where: { id: body.id },
        data: {
          labelEn: body.labelEn,
          labelAr: body.labelAr,
          href: body.href,
          displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
          isEnabled: body.isEnabled,
        },
      });
      return NextResponse.json({ navigationItem: nav });
    }

    if (body.type === 'PAGE' && body.id) {
      const page = await prisma.websitePage.update({
        where: { id: body.id },
        data: {
          titleEn: body.titleEn,
          titleAr: body.titleAr,
          subtitleEn: body.subtitleEn,
          subtitleAr: body.subtitleAr,
          contentEn: body.contentEn,
          contentAr: body.contentAr,
          metaTitleEn: body.metaTitleEn,
          metaTitleAr: body.metaTitleAr,
          metaDescriptionEn: body.metaDescriptionEn,
          metaDescriptionAr: body.metaDescriptionAr,
          canonicalUrl: body.canonicalUrl,
          noIndex: body.noIndex,
          isEnabled: body.isEnabled,
          status: body.status,
        },
      });
      return NextResponse.json({ page });
    }

    if (body.type === 'FAQ' && body.id) {
      const faq = await prisma.faqItem.update({
        where: { id: body.id },
        data: {
          questionEn: body.questionEn,
          questionAr: body.questionAr,
          answerEn: body.answerEn,
          answerAr: body.answerAr,
          isEnabled: body.isEnabled,
          status: body.status,
          displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
        },
      });
      return NextResponse.json({ faq });
    }

    return NextResponse.json({ error: 'Invalid content update request' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Content update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth('content:write');
  if (auth.errorResponse) return auth.errorResponse;

  const type = req.nextUrl.searchParams.get('type');
  const id = req.nextUrl.searchParams.get('id');
  if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 });

  if (type === 'FAQ') {
    await prisma.faqItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
  if (type === 'NAV_ITEM') {
    await prisma.navigationItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
  if (type === 'PAGE') {
    await prisma.websitePage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unsupported delete type' }, { status: 400 });
}
