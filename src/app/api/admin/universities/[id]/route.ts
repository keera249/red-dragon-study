import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { recordAuditLog } from '@/lib/audit';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAuth('universities:read');
  if (auth.errorResponse) return auth.errorResponse;
  const { id } = await context.params;

  const university = await prisma.university.findUnique({
    where: { id },
    include: {
      programs: true,
      fees: true,
      sharedRequirements: { include: { requirement: true, override: true } },
      specificRequirements: true,
      galleries: { include: { images: true } },
      deadlines: true,
      scholarshipLinks: { include: { scholarship: true } },
    },
  });

  if (!university) {
    return NextResponse.json({ error: 'University not found' }, { status: 404 });
  }
  return NextResponse.json({ university });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAuth('universities:write');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;
  const { id } = await context.params;

  try {
    const existing = await prisma.university.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    const body = await req.json();

    // If changing publication status to PUBLISHED, validate required fields & permissions
    if (body.status === 'PUBLISHED') {
      if (!hasPermission(actor, 'universities:publish')) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to publish universities directly.' },
          { status: 403 }
        );
      }
      const targetName = body.nameEn ?? existing.nameEn;
      if (!targetName || targetName.trim().length < 2) {
        return NextResponse.json(
          { error: 'Cannot publish a university without a valid English name.' },
          { status: 400 }
        );
      }
    }

    const newSlug = body.slug
      ? String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : existing.slug;

    const updated = await prisma.$transaction(async (tx) => {
      if (newSlug !== existing.slug) {
        await tx.universitySlugRedirect.upsert({
          where: { oldSlug: existing.slug },
          update: { universityId: existing.id },
          create: { oldSlug: existing.slug, universityId: existing.id },
        });
      }

      const updatedUni = await tx.university.update({
        where: { id },
        data: {
          slug: newSlug,
          nameEn: body.nameEn ?? existing.nameEn,
          nameAr: body.nameAr !== undefined ? body.nameAr : existing.nameAr,
          nameZh: body.nameZh !== undefined ? body.nameZh : existing.nameZh,
          logoUrl: body.logoUrl !== undefined ? body.logoUrl : existing.logoUrl,
          shortDescriptionEn:
            body.shortDescriptionEn !== undefined ? body.shortDescriptionEn : existing.shortDescriptionEn,
          shortDescriptionAr:
            body.shortDescriptionAr !== undefined ? body.shortDescriptionAr : existing.shortDescriptionAr,
          detailedDescriptionEn:
            body.detailedDescriptionEn !== undefined
              ? body.detailedDescriptionEn
              : existing.detailedDescriptionEn,
          detailedDescriptionAr:
            body.detailedDescriptionAr !== undefined
              ? body.detailedDescriptionAr
              : existing.detailedDescriptionAr,
          universityType: body.universityType !== undefined ? body.universityType : existing.universityType,
          country: body.country !== undefined ? body.country : existing.country,
          province: body.province !== undefined ? body.province : existing.province,
          city: body.city !== undefined ? body.city : existing.city,
          district: body.district !== undefined ? body.district : existing.district,
          address: body.address !== undefined ? body.address : existing.address,
          latitude: body.latitude !== undefined ? body.latitude : existing.latitude,
          longitude: body.longitude !== undefined ? body.longitude : existing.longitude,
          mapUrl: body.mapUrl !== undefined ? body.mapUrl : existing.mapUrl,
          officialWebsite: body.officialWebsite !== undefined ? body.officialWebsite : existing.officialWebsite,
          officialAdmissionsUrl:
            body.officialAdmissionsUrl !== undefined
              ? body.officialAdmissionsUrl
              : existing.officialAdmissionsUrl,
          officialContact: body.officialContact !== undefined ? body.officialContact : existing.officialContact,
          accreditationInfoEn:
            body.accreditationInfoEn !== undefined ? body.accreditationInfoEn : existing.accreditationInfoEn,
          accreditationInfoAr:
            body.accreditationInfoAr !== undefined ? body.accreditationInfoAr : existing.accreditationInfoAr,
          recognitionInfoEn:
            body.recognitionInfoEn !== undefined ? body.recognitionInfoEn : existing.recognitionInfoEn,
          recognitionInfoAr:
            body.recognitionInfoAr !== undefined ? body.recognitionInfoAr : existing.recognitionInfoAr,
          rankingInfoEn: body.rankingInfoEn !== undefined ? body.rankingInfoEn : existing.rankingInfoEn,
          rankingInfoAr: body.rankingInfoAr !== undefined ? body.rankingInfoAr : existing.rankingInfoAr,
          accommodationAvailable:
            body.accommodationAvailable !== undefined
              ? body.accommodationAvailable
              : existing.accommodationAvailable,
          accommodationDescEn:
            body.accommodationDescEn !== undefined ? body.accommodationDescEn : existing.accommodationDescEn,
          accommodationDescAr:
            body.accommodationDescAr !== undefined ? body.accommodationDescAr : existing.accommodationDescAr,
          whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : existing.whatsappNumber,
          internalNotes: body.internalNotes !== undefined ? body.internalNotes : existing.internalNotes,
          isFeatured: body.isFeatured !== undefined ? body.isFeatured : existing.isFeatured,
          acceptingApplications:
            body.acceptingApplications !== undefined
              ? body.acceptingApplications
              : existing.acceptingApplications,
          status: body.status ?? existing.status,
          sourceUrl: body.sourceUrl !== undefined ? body.sourceUrl : existing.sourceUrl,
          seoTitleEn: body.seoTitleEn !== undefined ? body.seoTitleEn : existing.seoTitleEn,
          seoTitleAr: body.seoTitleAr !== undefined ? body.seoTitleAr : existing.seoTitleAr,
          seoDescriptionEn:
            body.seoDescriptionEn !== undefined ? body.seoDescriptionEn : existing.seoDescriptionEn,
          seoDescriptionAr:
            body.seoDescriptionAr !== undefined ? body.seoDescriptionAr : existing.seoDescriptionAr,
          canonicalUrl: body.canonicalUrl !== undefined ? body.canonicalUrl : existing.canonicalUrl,
          noIndex: body.noIndex !== undefined ? body.noIndex : existing.noIndex,
        },
      });

      // Synchronize Programs & Program Tuition if passed from All-in-One form
      if (Array.isArray(body.programs)) {
        await tx.universityFee.deleteMany({
          where: { universityId: id, category: 'TUITION' },
        });
        await tx.universityProgram.deleteMany({
          where: { universityId: id },
        });

        for (const [idx, prog] of body.programs.entries()) {
          if (!prog.nameEn || !String(prog.nameEn).trim()) continue;
          const progSlug = `${newSlug}-${String(prog.nameEn)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}-${idx + 1}`;

          const createdProg = await tx.universityProgram.create({
            data: {
              universityId: id,
              slug: progSlug,
              nameEn: String(prog.nameEn).trim(),
              nameAr: prog.nameAr ? String(prog.nameAr).trim() : null,
              degreeLevel: prog.degreeLevel || 'BACHELOR',
              languageOfInstruction: prog.languageOfInstruction || 'ENGLISH',
              durationEn: prog.durationEn || '4 Years',
              status: 'PUBLISHED',
            },
          });

          if (prog.tuitionAmount && Number(prog.tuitionAmount) > 0) {
            await tx.universityFee.create({
              data: {
                universityId: id,
                programId: createdProg.id,
                category: 'TUITION',
                titleEn: `${prog.nameEn} Tuition Fee`,
                titleAr: prog.nameAr ? `رسوم دراسة ${prog.nameAr}` : 'رسوم دراسية',
                amount: Number(prog.tuitionAmount),
                currency: prog.tuitionCurrency || 'CNY',
                period: prog.tuitionPeriod || 'ANNUALLY',
                academicYear: body.academicYear || '2027-2028',
                isConfirmed: true,
                status: 'PUBLISHED',
              },
            });
          }
        }
      }

      // Synchronize Accommodation Fees if passed
      if (Array.isArray(body.fees)) {
        await tx.universityFee.deleteMany({
          where: { universityId: id, category: 'ACCOMMODATION' },
        });
        for (const fee of body.fees) {
          if (!fee.amount || Number(fee.amount) <= 0) continue;
          await tx.universityFee.create({
            data: {
              universityId: id,
              category: fee.category || 'ACCOMMODATION',
              titleEn: fee.titleEn || `${updatedUni.nameEn} Accommodation`,
              titleAr: fee.titleAr || 'السكن الطلابي',
              amount: Number(fee.amount),
              currency: fee.currency || 'CNY',
              period: fee.period || 'ANNUALLY',
              academicYear: fee.academicYear || body.academicYear || '2027-2028',
              isConfirmed: true,
              status: 'PUBLISHED',
            },
          });
        }
      }

      // Synchronize Application Deadline if passed
      if (body.applicationDeadlineDate) {
        await tx.applicationDeadline.deleteMany({ where: { universityId: id } });
        await tx.applicationDeadline.create({
          data: {
            universityId: id,
            titleEn: `${updatedUni.nameEn} Regular Application Deadline`,
            titleAr: updatedUni.nameAr
              ? `الموعد النهائي للتقديم - ${updatedUni.nameAr}`
              : 'الموعد النهائي للتقديم',
            openingDate: body.applicationOpeningDate
              ? new Date(body.applicationOpeningDate)
              : new Date(),
            closingDate: new Date(body.applicationDeadlineDate),
            academicYear: body.academicYear || '2027-2028',
            status: 'PUBLISHED',
          },
        });
      }

      // Synchronize Scholarship Links if passed
      if (Array.isArray(body.selectedScholarshipIds)) {
        await tx.scholarshipUniversity.deleteMany({ where: { universityId: id } });
        for (const schId of body.selectedScholarshipIds) {
          await tx.scholarshipUniversity.create({
            data: { universityId: id, scholarshipId: schId },
          });
        }
      }

      // Synchronize Shared Requirements if passed
      if (Array.isArray(body.selectedRequirementIds)) {
        await tx.universityRequirement.deleteMany({ where: { universityId: id } });
        for (const [idx, reqId] of body.selectedRequirementIds.entries()) {
          await tx.universityRequirement.create({
            data: {
              universityId: id,
              requirementId: reqId,
              displayOrder: idx + 1,
              isEnabled: true,
              status: 'PUBLISHED',
            },
          });
        }
      }

      // Synchronize Gallery Images if passed
      if (Array.isArray(body.campusImages) && body.campusImages.length > 0) {
        let campusGal = await tx.mediaGallery.findFirst({
          where: { universityId: id, category: 'CAMPUS' },
        });
        if (!campusGal) {
          campusGal = await tx.mediaGallery.create({
            data: {
              universityId: id,
              titleEn: `${updatedUni.nameEn} Campus Photos`,
              titleAr: `صور الحرم الجامعي - ${updatedUni.nameAr || updatedUni.nameEn}`,
              category: 'CAMPUS',
              coverImageUrl: body.campusImages[0].imageUrl.trim(),
              status: 'PUBLISHED',
            },
          });
        }
        await tx.galleryImage.deleteMany({ where: { galleryId: campusGal.id } });
        for (let i = 0; i < body.campusImages.length; i++) {
          const img = body.campusImages[i];
          if (!img.imageUrl || !img.imageUrl.trim()) continue;
          await tx.galleryImage.create({
            data: {
              galleryId: campusGal.id,
              imageUrl: img.imageUrl.trim(),
              captionEn: img.captionEn || `${updatedUni.nameEn} Campus`,
              captionAr: img.captionAr || 'الحرم الجامعي',
              displayOrder: i + 1,
              isPublished: true,
            },
          });
        }
      }

      if (Array.isArray(body.accommodationImages) && body.accommodationImages.length > 0) {
        let dormGal = await tx.mediaGallery.findFirst({
          where: { universityId: id, category: 'DORMITORY' },
        });
        if (!dormGal) {
          dormGal = await tx.mediaGallery.create({
            data: {
              universityId: id,
              titleEn: `${updatedUni.nameEn} Dormitory Photos`,
              titleAr: `صور السكن الطلابي - ${updatedUni.nameAr || updatedUni.nameEn}`,
              category: 'DORMITORY',
              coverImageUrl: body.accommodationImages[0].imageUrl.trim(),
              status: 'PUBLISHED',
            },
          });
        }
        await tx.galleryImage.deleteMany({ where: { galleryId: dormGal.id } });
        for (let i = 0; i < body.accommodationImages.length; i++) {
          const img = body.accommodationImages[i];
          if (!img.imageUrl || !img.imageUrl.trim()) continue;
          await tx.galleryImage.create({
            data: {
              galleryId: dormGal.id,
              imageUrl: img.imageUrl.trim(),
              captionEn: img.captionEn || `${updatedUni.nameEn} Dormitory`,
              captionAr: img.captionAr || 'السكن الطلابي',
              displayOrder: i + 1,
              isPublished: true,
            },
          });
        }
      }

      return updatedUni;
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'UNIVERSITY_UPDATED',
      entityType: 'University',
      entityId: updated.id,
      summary: `Updated university ${updated.nameEn} (status: ${updated.status})`,
    });

    return NextResponse.json({ university: updated });
  } catch (err: any) {
    console.error('Update university error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update university' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAuth('universities:delete');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;
  const { id } = await context.params;

  // Require confirmation flag for destructive operation per Section 18 & 19
  const confirm = req.nextUrl.searchParams.get('confirm') === 'true';
  if (!confirm) {
    return NextResponse.json(
      { error: 'Destructive operation requires explicit confirmation (?confirm=true).' },
      { status: 400 }
    );
  }

  const existing = await prisma.university.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'University not found' }, { status: 404 });
  }

  // Delete university assignments without deleting GlobalRequirement or Scholarship records
  await prisma.university.delete({ where: { id } });

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'UNIVERSITY_DELETED',
    entityType: 'University',
    entityId: id,
    summary: `Deleted university ${existing.nameEn}`,
  });

  return NextResponse.json({ ok: true });
}
