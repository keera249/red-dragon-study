import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { validateUploadedImageFile } from '@/lib/media-validation';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('media:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const validation = validateUploadedImageFile({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });

    if (!validation.valid || !validation.safeFileName) {
      return NextResponse.json({ error: validation.error || 'Invalid file' }, { status: 400 });
    }

    const isGenuinePhoto = formData.get('isGenuinePhoto') !== 'false';
    if (!isGenuinePhoto) {
      return NextResponse.json(
        {
          error:
            'Section 7 Policy: AI-generated or illustrative images must not be uploaded as genuine photographs of university facilities.',
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const diskPath = path.join(uploadDir, validation.safeFileName);
    await fs.writeFile(diskPath, buffer);

    const publicUrl = `/uploads/${validation.safeFileName}`;

    const asset = await prisma.mediaAsset.create({
      data: {
        fileName: validation.safeFileName,
        filePath: publicUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        altEn: (formData.get('altEn') as string) || null,
        altAr: (formData.get('altAr') as string) || null,
        captionEn: (formData.get('captionEn') as string) || null,
        captionAr: (formData.get('captionAr') as string) || null,
        sourceInfo: (formData.get('sourceInfo') as string) || 'Official University Media',
        sourceUrl: (formData.get('sourceUrl') as string) || null,
        verificationStatus: (formData.get('verificationStatus') as string) || 'VERIFIED',
        isGenuinePhoto: true,
        uploadedById: actor.id,
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'MEDIA_UPLOADED',
      entityType: 'MediaAsset',
      entityId: asset.id,
      summary: `Uploaded image ${asset.fileName}`,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
