import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth('media:read');
  if (auth.errorResponse) return auth.errorResponse;

  const universityId = req.nextUrl.searchParams.get('universityId') || undefined;
  const [galleries, mediaAssets] = await Promise.all([
    prisma.mediaGallery.findMany({
      where: {
        ...(universityId ? { universityId } : {}),
        status: { not: 'DELETED' },
      },
      include: {
        university: { select: { id: true, nameEn: true, nameAr: true } },
        images: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  return NextResponse.json({ galleries, mediaAssets });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('media:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();

    if (body.action === 'ADD_IMAGE') {
      if (!body.galleryId || !body.imageUrl) {
        return NextResponse.json({ error: 'galleryId and imageUrl are required' }, { status: 400 });
      }
      const image = await prisma.galleryImage.create({
        data: {
          galleryId: body.galleryId,
          mediaAssetId: body.mediaAssetId || null,
          imageUrl: body.imageUrl,
          altEn: body.altEn || null,
          altAr: body.altAr || null,
          captionEn: body.captionEn || null,
          captionAr: body.captionAr || null,
          descriptionEn: body.descriptionEn || null,
          descriptionAr: body.descriptionAr || null,
          sourceInfo: body.sourceInfo || null,
          verificationStatus: body.verificationStatus || 'VERIFIED',
          displayOrder: Number(body.displayOrder || 1),
          isPublished: body.isPublished !== false,
        },
      });
      return NextResponse.json({ image }, { status: 201 });
    }

    if (!body.universityId || !body.titleEn) {
      return NextResponse.json({ error: 'universityId and titleEn are required' }, { status: 400 });
    }

    const isAccom =
      Boolean(body.isAccommodation) ||
      ['ACCOMMODATION', 'DORMITORY_ROOMS', 'SHARED_FACILITIES'].includes(body.category);

    const gallery = await prisma.mediaGallery.create({
      data: {
        universityId: body.universityId,
        category: body.category || 'CAMPUS',
        customCategoryEn: body.customCategoryEn || null,
        customCategoryAr: body.customCategoryAr || null,
        titleEn: body.titleEn,
        titleAr: body.titleAr || null,
        descriptionEn: body.descriptionEn || null,
        descriptionAr: body.descriptionAr || null,
        isAccommodation: isAccom,
        coverImageUrl: body.coverImageUrl || null,
        displayOrder: Number(body.displayOrder || 1),
        isEnabled: body.isEnabled !== false,
        status: body.status || 'PUBLISHED',
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'GALLERY_CREATED',
      entityType: 'MediaGallery',
      entityId: gallery.id,
      summary: `Created gallery ${gallery.titleEn}`,
    });

    return NextResponse.json({ gallery }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Gallery operation failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('media:write');
  if (auth.errorResponse) return auth.errorResponse;

  const body = await req.json();

  if (body.action === 'UPDATE_IMAGE' && body.imageId) {
    const img = await prisma.galleryImage.update({
      where: { id: body.imageId },
      data: {
        imageUrl: body.imageUrl,
        captionEn: body.captionEn,
        captionAr: body.captionAr,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
        isPublished: body.isPublished,
        verificationStatus: body.verificationStatus,
      },
    });
    return NextResponse.json({ image: img });
  }

  if (!body.id) return NextResponse.json({ error: 'Gallery id required' }, { status: 400 });

  const updated = await prisma.mediaGallery.update({
    where: { id: body.id },
    data: {
      titleEn: body.titleEn,
      titleAr: body.titleAr,
      category: body.category,
      coverImageUrl: body.coverImageUrl,
      isEnabled: body.isEnabled,
      status: body.status,
      displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
    },
  });

  return NextResponse.json({ gallery: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth('media:write');
  if (auth.errorResponse) return auth.errorResponse;

  const imageId = req.nextUrl.searchParams.get('imageId');
  const galleryId = req.nextUrl.searchParams.get('galleryId');

  if (imageId) {
    await prisma.galleryImage.delete({ where: { id: imageId } });
    return NextResponse.json({ ok: true });
  }

  if (galleryId) {
    await prisma.mediaGallery.delete({ where: { id: galleryId } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'imageId or galleryId required' }, { status: 400 });
}
