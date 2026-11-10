import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { recordAuditLog } from '@/lib/audit';
import { generateUniversityCode } from '@/lib/university-code';

const programItemSchema = z.object({
  nameEn: z.string().trim().min(1),
  nameAr: z.string().trim().optional().nullable(),
  nameZh: z.string().trim().optional().nullable(),
  degreeLevel: z.string().default('BACHELOR'),
  disciplineEn: z.string().optional().nullable(),
  disciplineAr: z.string().optional().nullable(),
  languageOfInstruction: z.string().default('ENGLISH'),
  durationEn: z.string().optional().nullable(),
  durationAr: z.string().optional().nullable(),
  tuitionAmount: z.union([z.number(), z.string()]).optional().nullable(),
  tuitionCurrency: z.string().default('CNY'),
  tuitionPeriod: z.string().default('ANNUALLY'),
  applicationFeeAmount: z.union([z.number(), z.string()]).optional().nullable(),
  eligibilityEn: z.string().optional().nullable(),
  eligibilityAr: z.string().optional().nullable(),
  languageReqEn: z.string().optional().nullable(),
  languageReqAr: z.string().optional().nullable(),
  openingDate: z.string().optional().nullable(),
  deadlineDate: z.string().optional().nullable(),
});

const feeItemSchema = z.object({
  category: z.string().default('ACCOMMODATION'),
  titleEn: z.string().trim().min(1),
  titleAr: z.string().trim().optional().nullable(),
  amount: z.union([z.number(), z.string()]),
  currency: z.string().default('CNY'),
  period: z.string().default('ANNUALLY'),
  academicYear: z.string().optional().nullable(),
  isConfirmed: z.boolean().default(true),
  sourceUrl: z.string().optional().nullable(),
});

const specificReqItemSchema = z.object({
  nameEn: z.string().trim().min(1),
  nameAr: z.string().trim().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  instructionsEn: z.string().optional().nullable(),
  instructionsAr: z.string().optional().nullable(),
  isRequired: z.boolean().default(true),
});

const galleryImageItemSchema = z.object({
  imageUrl: z.string().trim().min(1),
  captionEn: z.string().optional().nullable(),
  captionAr: z.string().optional().nullable(),
  sourceInfo: z.string().optional().nullable(),
});

const universityCreateSchema = z.object({
  slug: z.string().trim().optional(),
  nameEn: z.string().trim().min(2).max(200),
  nameAr: z.string().trim().optional().nullable(),
  nameZh: z.string().trim().optional().nullable(),
  logoUrl: z.string().trim().optional().nullable(),
  shortDescriptionEn: z.string().optional().nullable(),
  shortDescriptionAr: z.string().optional().nullable(),
  detailedDescriptionEn: z.string().optional().nullable(),
  detailedDescriptionAr: z.string().optional().nullable(),
  universityType: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  mapUrl: z.string().optional().nullable(),
  officialWebsite: z.string().optional().nullable(),
  officialAdmissionsUrl: z.string().optional().nullable(),
  officialContact: z.string().optional().nullable(),
  accreditationInfoEn: z.string().optional().nullable(),
  accreditationInfoAr: z.string().optional().nullable(),
  recognitionInfoEn: z.string().optional().nullable(),
  recognitionInfoAr: z.string().optional().nullable(),
  rankingInfoEn: z.string().optional().nullable(),
  rankingInfoAr: z.string().optional().nullable(),
  accommodationAvailable: z.boolean().optional().nullable(),
  accommodationDescEn: z.string().optional().nullable(),
  accommodationDescAr: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  acceptingApplications: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'DISABLED', 'ARCHIVED']).optional(),
  verificationStatus: z.string().optional(),
  sourceUrl: z.string().optional().nullable(),

  // Unified All-in-One Fields during University Creation:
  applicationOpeningDate: z.string().optional().nullable(),
  applicationDeadlineDate: z.string().optional().nullable(),
  academicYear: z.string().optional().nullable(),
  programs: z.array(programItemSchema).optional(),
  fees: z.array(feeItemSchema).optional(),
  selectedRequirementIds: z.array(z.string()).optional(),
  requirementOverrides: z
    .record(
      z.string(),
      z.object({
        isRequiredOverride: z.boolean().optional().nullable(),
        customInstructionsEn: z.string().optional().nullable(),
        customInstructionsAr: z.string().optional().nullable(),
        isExcluded: z.boolean().optional(),
      })
    )
    .optional(),
  specificRequirements: z.array(specificReqItemSchema).optional(),
  selectedScholarshipIds: z.array(z.string()).optional(),
  campusImages: z.array(galleryImageItemSchema).optional(),
  accommodationImages: z.array(galleryImageItemSchema).optional(),
});

export async function GET() {
  const auth = await requireApiAuth('universities:read');
  if (auth.errorResponse) return auth.errorResponse;

  const universities = await prisma.university.findMany({
    where: { status: { not: 'DELETED' } },
    include: {
      programs: { where: { status: { not: 'DELETED' } } },
      fees: { where: { status: { not: 'DELETED' } } },
      sharedRequirements: { include: { requirement: true, override: true } },
      specificRequirements: { where: { status: { not: 'DELETED' } } },
      galleries: { include: { images: true } },
      deadlines: true,
      scholarshipLinks: { include: { scholarship: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const enriched = universities.map((u) => ({
    ...u,
    universityCode: generateUniversityCode(u),
  }));

  return NextResponse.json({ universities: enriched });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('universities:write', req);
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();

    // Handle university duplication action
    if (body?.action === 'DUPLICATE' && body?.sourceUniversityId) {
      const source = await prisma.university.findUnique({
        where: { id: body.sourceUniversityId },
        include: {
          sharedRequirements: { include: { override: true } },
        },
      });
      if (!source) {
        return NextResponse.json({ error: 'Source university not found' }, { status: 404 });
      }
      const copySlug = `${source.slug}-copy-${Date.now().toString().slice(-4)}`;
      const duplicated = await prisma.university.create({
        data: {
          slug: copySlug,
          nameEn: `${source.nameEn} (Copy)`,
          nameAr: source.nameAr ? `${source.nameAr} (نسخة)` : null,
          nameZh: source.nameZh,
          logoUrl: source.logoUrl,
          shortDescriptionEn: source.shortDescriptionEn,
          shortDescriptionAr: source.shortDescriptionAr,
          detailedDescriptionEn: source.detailedDescriptionEn,
          detailedDescriptionAr: source.detailedDescriptionAr,
          universityType: source.universityType,
          country: source.country,
          province: source.province,
          city: source.city,
          district: source.district,
          address: source.address,
          latitude: source.latitude,
          longitude: source.longitude,
          mapUrl: source.mapUrl,
          officialWebsite: source.officialWebsite,
          officialAdmissionsUrl: source.officialAdmissionsUrl,
          officialContact: source.officialContact,
          accreditationInfoEn: source.accreditationInfoEn,
          accreditationInfoAr: source.accreditationInfoAr,
          recognitionInfoEn: source.recognitionInfoEn,
          recognitionInfoAr: source.recognitionInfoAr,
          accommodationAvailable: source.accommodationAvailable,
          accommodationDescEn: source.accommodationDescEn,
          accommodationDescAr: source.accommodationDescAr,
          whatsappNumber: source.whatsappNumber,
          internalNotes: source.internalNotes,
          status: 'DRAFT',
          verificationStatus: 'PENDING_VERIFICATION',
        },
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'UNIVERSITY_DUPLICATED',
        entityType: 'University',
        entityId: duplicated.id,
        summary: `Duplicated university ${source.nameEn} as ${duplicated.nameEn}`,
      });

      return NextResponse.json({ university: duplicated }, { status: 201 });
    }

    const parsed = universityCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid university data' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const rawSlug =
      data.slug && data.slug.trim().length > 0
        ? data.slug
        : data.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const normalizedSlug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-|-$/g, '');

    // Enforce publish permission if creating directly as PUBLISHED
    let finalStatus = data.status || 'DRAFT';
    if (finalStatus === 'PUBLISHED' && !hasPermission(actor, 'universities:publish')) {
      finalStatus = 'DRAFT';
    }

    const created = await prisma.$transaction(async (tx) => {
      // 1. Create the University record
      const uni = await tx.university.create({
        data: {
          slug: normalizedSlug,
          nameEn: data.nameEn,
          nameAr: data.nameAr || null,
          nameZh: data.nameZh || null,
          logoUrl: data.logoUrl || '/logo.jpeg',
          shortDescriptionEn: data.shortDescriptionEn || null,
          shortDescriptionAr: data.shortDescriptionAr || null,
          detailedDescriptionEn: data.detailedDescriptionEn || null,
          detailedDescriptionAr: data.detailedDescriptionAr || null,
          universityType: data.universityType || null,
          country: data.country || 'China',
          province: data.province || null,
          city: data.city || null,
          district: data.district || null,
          address: data.address || null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          mapUrl: data.mapUrl || null,
          officialWebsite: data.officialWebsite || null,
          officialAdmissionsUrl: data.officialAdmissionsUrl || null,
          officialContact: data.officialContact || null,
          accreditationInfoEn: data.accreditationInfoEn || null,
          accreditationInfoAr: data.accreditationInfoAr || null,
          recognitionInfoEn: data.recognitionInfoEn || null,
          recognitionInfoAr: data.recognitionInfoAr || null,
          rankingInfoEn: data.rankingInfoEn || null,
          rankingInfoAr: data.rankingInfoAr || null,
          accommodationAvailable: data.accommodationAvailable ?? null,
          accommodationDescEn: data.accommodationDescEn || null,
          accommodationDescAr: data.accommodationDescAr || null,
          whatsappNumber: data.whatsappNumber || null,
          internalNotes: data.internalNotes || null,
          isFeatured: Boolean(data.isFeatured),
          acceptingApplications: data.acceptingApplications !== false,
          status: finalStatus,
          verificationStatus: 'PENDING_VERIFICATION',
          sourceUrl: data.sourceUrl || null,
        },
      });

      // 2. Create Programs & Program Tuition Fees
      for (const [idx, prog] of (data.programs ?? []).entries()) {
        if (!prog.nameEn?.trim()) continue;
        const pSlug = `${prog.nameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')}-${idx + 1}`;
        const tuitionNum =
          prog.tuitionAmount !== undefined && prog.tuitionAmount !== null && prog.tuitionAmount !== ''
            ? Number(prog.tuitionAmount)
            : null;
        const appFeeNum =
          prog.applicationFeeAmount !== undefined &&
          prog.applicationFeeAmount !== null &&
          prog.applicationFeeAmount !== ''
            ? Number(prog.applicationFeeAmount)
            : null;

        const createdProg = await tx.universityProgram.create({
          data: {
            universityId: uni.id,
            slug: pSlug,
            nameEn: prog.nameEn.trim(),
            nameAr: prog.nameAr?.trim() || null,
            nameZh: prog.nameZh?.trim() || null,
            degreeLevel: prog.degreeLevel || 'BACHELOR',
            disciplineEn: prog.disciplineEn || null,
            disciplineAr: prog.disciplineAr || null,
            languageOfInstruction: prog.languageOfInstruction || 'ENGLISH',
            durationEn: prog.durationEn || null,
            durationAr: prog.durationAr || null,
            tuitionAmount: tuitionNum,
            tuitionCurrency: prog.tuitionCurrency || 'CNY',
            tuitionPeriod: prog.tuitionPeriod || 'ANNUALLY',
            applicationFeeAmount: appFeeNum,
            eligibilityEn: prog.eligibilityEn || null,
            eligibilityAr: prog.eligibilityAr || null,
            languageReqEn: prog.languageReqEn || null,
            languageReqAr: prog.languageReqAr || null,
            openingDate: prog.openingDate ? new Date(prog.openingDate) : null,
            deadlineDate: prog.deadlineDate
              ? new Date(prog.deadlineDate)
              : data.applicationDeadlineDate
              ? new Date(data.applicationDeadlineDate)
              : null,
            status: 'PUBLISHED',
          },
        });

        if (tuitionNum !== null && !Number.isNaN(tuitionNum)) {
          await tx.universityFee.create({
            data: {
              universityId: uni.id,
              programId: createdProg.id,
              category: 'TUITION',
              titleEn: `${createdProg.nameEn} Tuition`,
              titleAr: createdProg.nameAr ? `الرسوم الدراسية - ${createdProg.nameAr}` : null,
              amount: tuitionNum,
              currency: prog.tuitionCurrency || 'CNY',
              period: prog.tuitionPeriod || 'ANNUALLY',
              academicYear: data.academicYear || '2027-2028',
              isConfirmed: true,
              status: 'PUBLISHED',
            },
          });
        }
      }

      // 3. Create Additional University Fees (Accommodation, Insurance, etc.)
      for (const fee of data.fees ?? []) {
        const amt = Number(fee.amount);
        if (!fee.titleEn?.trim() || Number.isNaN(amt)) continue;
        await tx.universityFee.create({
          data: {
            universityId: uni.id,
            category: fee.category || 'ACCOMMODATION',
            titleEn: fee.titleEn.trim(),
            titleAr: fee.titleAr?.trim() || null,
            amount: amt,
            currency: fee.currency || 'CNY',
            period: fee.period || 'ANNUALLY',
            academicYear: fee.academicYear || data.academicYear || '2027-2028',
            isConfirmed: fee.isConfirmed !== false,
            sourceUrl: fee.sourceUrl || null,
            status: 'PUBLISHED',
          },
        });
      }

      // 4. Create University Application Deadline if provided
      if (data.applicationDeadlineDate) {
        await tx.applicationDeadline.create({
          data: {
            titleEn: `${uni.nameEn} Application Deadline`,
            titleAr: `آخر موعد للتقديم في ${uni.nameAr || uni.nameEn}`,
            universityId: uni.id,
            academicYear: data.academicYear || '2027-2028',
            openingDate: data.applicationOpeningDate ? new Date(data.applicationOpeningDate) : null,
            closingDate: new Date(data.applicationDeadlineDate),
            timezone: 'Asia/Shanghai',
            status: 'PUBLISHED',
          },
        });
      }

      // 5. Assign Shared Requirements & Per-University Overrides
      for (const [idx, reqId] of (data.selectedRequirementIds ?? []).entries()) {
        const assign = await tx.universityRequirement.create({
          data: {
            universityId: uni.id,
            requirementId: reqId,
            displayOrder: idx + 1,
            isEnabled: true,
            status: 'PUBLISHED',
          },
        });

        const ov = data.requirementOverrides?.[reqId];
        if (
          ov &&
          (typeof ov.isRequiredOverride === 'boolean' ||
            ov.customInstructionsEn ||
            ov.customInstructionsAr ||
            ov.isExcluded)
        ) {
          await tx.requirementOverride.create({
            data: {
              universityRequirementId: assign.id,
              isRequiredOverride:
                typeof ov.isRequiredOverride === 'boolean' ? ov.isRequiredOverride : null,
              customInstructionsEn: ov.customInstructionsEn || null,
              customInstructionsAr: ov.customInstructionsAr || null,
              isExcluded: Boolean(ov.isExcluded),
            },
          });
        }
      }

      // 6. Create University-Specific Requirements
      for (const [idx, sReq] of (data.specificRequirements ?? []).entries()) {
        if (!sReq.nameEn?.trim()) continue;
        await tx.universitySpecificRequirement.create({
          data: {
            universityId: uni.id,
            nameEn: sReq.nameEn.trim(),
            nameAr: sReq.nameAr?.trim() || null,
            descriptionEn: sReq.descriptionEn || null,
            descriptionAr: sReq.descriptionAr || null,
            instructionsEn: sReq.instructionsEn || null,
            instructionsAr: sReq.instructionsAr || null,
            isRequired: sReq.isRequired !== false,
            displayOrder: 50 + idx,
            isEnabled: true,
            status: 'PUBLISHED',
          },
        });
      }

      // 7. Link Selected Scholarships
      for (const schId of data.selectedScholarshipIds ?? []) {
        await tx.scholarshipUniversity.create({
          data: {
            universityId: uni.id,
            scholarshipId: schId,
          },
        });
      }

      // 8. Create Campus Photo Gallery if images were provided
      const validCampusImgs = (data.campusImages ?? []).filter((img) => img.imageUrl?.trim());
      if (validCampusImgs.length > 0) {
        const campusGallery = await tx.mediaGallery.create({
          data: {
            universityId: uni.id,
            category: 'CAMPUS',
            titleEn: `${uni.nameEn} Campus & Facilities`,
            titleAr: `صور الحرم الجامعي والمرافق - ${uni.nameAr || uni.nameEn}`,
            isAccommodation: false,
            coverImageUrl: validCampusImgs[0].imageUrl.trim(),
            displayOrder: 1,
            isEnabled: true,
            status: 'PUBLISHED',
          },
        });

        for (const [idx, img] of validCampusImgs.entries()) {
          await tx.galleryImage.create({
            data: {
              galleryId: campusGallery.id,
              imageUrl: img.imageUrl.trim(),
              captionEn: img.captionEn || null,
              captionAr: img.captionAr || null,
              sourceInfo: img.sourceInfo || 'Official University Photo',
              displayOrder: idx + 1,
              isPublished: true,
            },
          });
        }
      }

      // 9. Create Student Accommodation Gallery if images were provided
      const validAccomImgs = (data.accommodationImages ?? []).filter((img) => img.imageUrl?.trim());
      if (validAccomImgs.length > 0) {
        const accomGallery = await tx.mediaGallery.create({
          data: {
            universityId: uni.id,
            category: 'ACCOMMODATION',
            titleEn: `${uni.nameEn} Student Accommodation`,
            titleAr: `صور السكن الطلابي - ${uni.nameAr || uni.nameEn}`,
            isAccommodation: true,
            coverImageUrl: validAccomImgs[0].imageUrl.trim(),
            displayOrder: 2,
            isEnabled: true,
            status: 'PUBLISHED',
          },
        });

        for (const [idx, img] of validAccomImgs.entries()) {
          await tx.galleryImage.create({
            data: {
              galleryId: accomGallery.id,
              imageUrl: img.imageUrl.trim(),
              captionEn: img.captionEn || null,
              captionAr: img.captionAr || null,
              sourceInfo: img.sourceInfo || 'Verified Dormitory Photo',
              displayOrder: idx + 1,
              isPublished: true,
            },
          });
        }
      }

      return uni;
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'UNIVERSITY_CREATED',
      entityType: 'University',
      entityId: created.id,
      summary: `Created university ${created.nameEn} with programs, requirements, deadlines, and galleries`,
    });

    return NextResponse.json({ university: created }, { status: 201 });
  } catch (err: any) {
    console.error('Create university error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create university' }, { status: 500 });
  }
}
