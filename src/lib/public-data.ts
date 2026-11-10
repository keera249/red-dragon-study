import { prisma } from './prisma';
import {
  filterVisibleGalleries,
  filterVisibleScholarships,
  hasValidMapInformation,
  isRecordPubliclyVisible,
  resolveUniversityRequirements,
} from './visibility';
import { evaluateDeadline } from './deadlines';
import {
  generateUniversityCode,
  getPublicUniversityName,
  maskUniversityIdentityInText,
  matchesUniversityCodeOrName,
} from './university-code';

export interface UniversitySearchFilters {
  q?: string;
  city?: string;
  province?: string;
  degreeLevel?: string;
  language?: string;
  minTuition?: number;
  maxTuition?: number;
  hasScholarship?: boolean;
  fundingType?: string;
  applicationStatus?: string;
  hasAccommodation?: boolean;
  sortBy?: 'name' | 'recent' | 'updated' | 'deadline' | 'tuition';
  page?: number;
  pageSize?: number;
}

/**
 * Strips internal administrative notes, real university names, official websites, and
 * unpublished/disabled sub-entities from a university record before sending it to any
 * public page or API response. Replaces the public identity with an auto-generated University Code.
 */
export function sanitizePublicUniversity(uni: any, warningDays = 30, allowPreview = false) {
  if (!uni || !isRecordPubliclyVisible(uni, allowPreview)) return null;

  const { internalNotes, ...safeUni } = uni;
  const universityCode = generateUniversityCode(uni);
  const publicNameEn = getPublicUniversityName(universityCode, 'en');
  const publicNameAr = getPublicUniversityName(universityCode, 'ar');

  const visiblePrograms = (uni.programs ?? [])
    .filter((p: any) => isRecordPubliclyVisible(p, allowPreview))
    .map((p: any) => {
      const { internalNotes: _pNotes, ...safeProg } = p;
      const deadlineInfo = evaluateDeadline(
        {
          openingDate: p.openingDate,
          closingDate: p.deadlineDate,
          status: p.status,
        },
        { warningDays }
      );
      return {
        ...safeProg,
        nameEn: maskUniversityIdentityInText(p.nameEn, uni, universityCode) || p.nameEn,
        nameAr: maskUniversityIdentityInText(p.nameAr, uni, universityCode),
        eligibilityEn: maskUniversityIdentityInText(p.eligibilityEn, uni, universityCode),
        eligibilityAr: maskUniversityIdentityInText(p.eligibilityAr, uni, universityCode),
        additionalNotesEn: maskUniversityIdentityInText(p.additionalNotesEn, uni, universityCode),
        additionalNotesAr: maskUniversityIdentityInText(p.additionalNotesAr, uni, universityCode),
        officialProgramUrl: null,
        sourceUrl: null,
        deadlineInfo,
      };
    });

  const visibleFees = (uni.fees ?? [])
    .filter((f: any) => isRecordPubliclyVisible(f, allowPreview))
    .map((f: any) => ({
      ...f,
      titleEn: maskUniversityIdentityInText(f.titleEn, uni, universityCode) || f.titleEn,
      titleAr: maskUniversityIdentityInText(f.titleAr, uni, universityCode),
      notesEn: maskUniversityIdentityInText(f.notesEn, uni, universityCode),
      notesAr: maskUniversityIdentityInText(f.notesAr, uni, universityCode),
      sourceUrl: null,
    }));

  const linkedScholarships = (uni.scholarshipLinks ?? [])
    .map((link: any) => link.scholarship)
    .filter(Boolean);
  const visibleScholarships = filterVisibleScholarships(linkedScholarships, allowPreview).map((s: any) => {
    const { internalNotes: _sNotes, ...safeSch } = s;
    return {
      ...safeSch,
      nameEn: maskUniversityIdentityInText(s.nameEn, uni, universityCode) || s.nameEn,
      nameAr: maskUniversityIdentityInText(s.nameAr, uni, universityCode),
      providerEn: maskUniversityIdentityInText(s.providerEn, uni, universityCode),
      providerAr: maskUniversityIdentityInText(s.providerAr, uni, universityCode),
      officialUrl: null,
      sourceUrl: null,
      deadlineInfo: evaluateDeadline(
        { openingDate: s.openingDate, closingDate: s.deadlineDate, status: s.status },
        { warningDays }
      ),
    };
  });

  const resolvedRequirements = resolveUniversityRequirements(
    uni.sharedRequirements,
    uni.specificRequirements
  ).map((r: any) => ({
    ...r,
    nameEn: maskUniversityIdentityInText(r.nameEn, uni, universityCode) || r.nameEn,
    nameAr: maskUniversityIdentityInText(r.nameAr, uni, universityCode),
    descriptionEn: maskUniversityIdentityInText(r.descriptionEn, uni, universityCode),
    descriptionAr: maskUniversityIdentityInText(r.descriptionAr, uni, universityCode),
    instructionsEn: maskUniversityIdentityInText(r.instructionsEn, uni, universityCode),
    instructionsAr: maskUniversityIdentityInText(r.instructionsAr, uni, universityCode),
  }));

  const campusGalleries = filterVisibleGalleries(uni.galleries, {
    excludeAccommodation: true,
    allowPreview,
  }).map((g: any) => ({
    ...g,
    titleEn: maskUniversityIdentityInText(g.titleEn, uni, universityCode) || g.titleEn,
    titleAr: maskUniversityIdentityInText(g.titleAr, uni, universityCode),
    images: (g.images ?? []).map((img: any) => ({
      ...img,
      captionEn: maskUniversityIdentityInText(img.captionEn, uni, universityCode),
      captionAr: maskUniversityIdentityInText(img.captionAr, uni, universityCode),
      sourceInfo: null,
    })),
  }));

  const accommodationGalleries = filterVisibleGalleries(uni.galleries, {
    onlyAccommodation: true,
    allowPreview,
  }).map((g: any) => ({
    ...g,
    titleEn: maskUniversityIdentityInText(g.titleEn, uni, universityCode) || g.titleEn,
    titleAr: maskUniversityIdentityInText(g.titleAr, uni, universityCode),
    images: (g.images ?? []).map((img: any) => ({
      ...img,
      captionEn: maskUniversityIdentityInText(img.captionEn, uni, universityCode),
      captionAr: maskUniversityIdentityInText(img.captionAr, uni, universityCode),
      sourceInfo: null,
    })),
  }));

  const visibleDeadlines = (uni.deadlines ?? [])
    .filter((d: any) => isRecordPubliclyVisible(d, allowPreview))
    .map((d: any) => ({
      ...d,
      titleEn: maskUniversityIdentityInText(d.titleEn, uni, universityCode) || d.titleEn,
      titleAr: maskUniversityIdentityInText(d.titleAr, uni, universityCode),
      sourceUrl: null,
      evaluated: evaluateDeadline(d, { warningDays }),
    }))
    .filter((d: any) => d.evaluated.shouldDisplayPublicly);

  // Hide exact campus GPS/street map on public pages so map tiles do not reveal the university name
  const mapInfo = hasValidMapInformation({
    latitude: null,
    longitude: null,
    mapUrl: null,
    address: null,
  });

  return {
    ...safeUni,
    universityCode,
    nameEn: publicNameEn,
    nameAr: publicNameAr,
    nameZh: null,
    logoUrl: '/logo.jpeg',
    shortDescriptionEn: maskUniversityIdentityInText(uni.shortDescriptionEn, uni, universityCode),
    shortDescriptionAr: maskUniversityIdentityInText(uni.shortDescriptionAr, uni, universityCode),
    detailedDescriptionEn: maskUniversityIdentityInText(uni.detailedDescriptionEn, uni, universityCode),
    detailedDescriptionAr: maskUniversityIdentityInText(uni.detailedDescriptionAr, uni, universityCode),
    accreditationInfoEn: maskUniversityIdentityInText(uni.accreditationInfoEn, uni, universityCode),
    accreditationInfoAr: maskUniversityIdentityInText(uni.accreditationInfoAr, uni, universityCode),
    recognitionInfoEn: maskUniversityIdentityInText(uni.recognitionInfoEn, uni, universityCode),
    recognitionInfoAr: maskUniversityIdentityInText(uni.recognitionInfoAr, uni, universityCode),
    rankingInfoEn: maskUniversityIdentityInText(uni.rankingInfoEn, uni, universityCode),
    rankingInfoAr: maskUniversityIdentityInText(uni.rankingInfoAr, uni, universityCode),
    accommodationDescEn: maskUniversityIdentityInText(uni.accommodationDescEn, uni, universityCode),
    accommodationDescAr: maskUniversityIdentityInText(uni.accommodationDescAr, uni, universityCode),
    address: null,
    latitude: null,
    longitude: null,
    mapUrl: null,
    officialWebsite: null,
    officialAdmissionsUrl: null,
    officialContact: null,
    sourceUrl: null,
    programs: visiblePrograms,
    fees: visibleFees,
    scholarships: visibleScholarships,
    requirements: resolvedRequirements,
    campusGalleries,
    accommodationGalleries,
    deadlines: visibleDeadlines,
    mapInfo,
  };
}

/**
 * Finds a university by either its slug OR its generated University Code (e.g. "UNI-4821" or "4821").
 */
export async function findUniversityBySlugOrCode(slugOrCode: string, include?: any) {
  const decoded = decodeURIComponent(slugOrCode || '').trim();
  if (!decoded) return null;

  // 1. Direct slug match
  const bySlug = await prisma.university.findUnique({
    where: { slug: decoded },
    ...(include ? { include } : {}),
  });
  if (bySlug) return bySlug;

  // 2. Match by generated University Code (e.g. "UNI-4821" or "4821")
  const normalizedTarget = decoded.toUpperCase().startsWith('UNI-')
    ? decoded.toUpperCase()
    : `UNI-${decoded.replace(/^#/, '')}`;

  const all = await prisma.university.findMany({
    where: { status: { not: 'DELETED' } },
    ...(include ? { include } : {}),
  });

  return (
    all.find((u) => {
      const code = generateUniversityCode(u).toUpperCase();
      return code === normalizedTarget || code === decoded.toUpperCase();
    }) || null
  );
}

/**
 * Searches and filters published universities without ever exposing draft/unpublished/archived/deleted records.
 */
export async function searchPublicUniversities(filters: UniversitySearchFilters = {}) {
  const sys = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
  const warningDays = sys?.deadlineWarningDays ?? 30;
  const pageSize = filters.pageSize ?? sys?.itemsPerPage ?? 9;
  const page = Math.max(1, filters.page ?? 1);

  const rawUniversities = await prisma.university.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      programs: { where: { status: 'PUBLISHED' } },
      fees: { where: { status: 'PUBLISHED' } },
      scholarshipLinks: {
        include: {
          scholarship: true,
        },
      },
      sharedRequirements: {
        include: {
          requirement: true,
          override: true,
        },
      },
      specificRequirements: { where: { status: 'PUBLISHED', isEnabled: true } },
      galleries: {
        include: {
          images: true,
        },
      },
      deadlines: { where: { status: 'PUBLISHED' } },
    },
  });

  // Search query filter across University Code, cities, provinces, programs, languages, descriptions
  let filteredRaw = rawUniversities;
  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim().toLowerCase();
    filteredRaw = rawUniversities.filter((u) => {
      if (matchesUniversityCodeOrName(u, q)) return true;
      const haystacks = [
        u.shortDescriptionEn,
        u.shortDescriptionAr,
        u.detailedDescriptionEn,
        u.detailedDescriptionAr,
        ...u.programs.flatMap((p: any) => [
          p.nameEn,
          p.nameAr,
          p.nameZh,
          p.disciplineEn,
          p.disciplineAr,
          p.languageOfInstruction,
        ]),
      ];
      return haystacks.some((h) => typeof h === 'string' && h.toLowerCase().includes(q));
    });
  }

  let sanitized = filteredRaw
    .map((u) => sanitizePublicUniversity(u, warningDays, false))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  if (filters.city && filters.city !== 'ALL') {
    sanitized = sanitized.filter((u) => u.city?.toLowerCase() === filters.city!.toLowerCase());
  }

  if (filters.province && filters.province !== 'ALL') {
    sanitized = sanitized.filter((u) => u.province?.toLowerCase() === filters.province!.toLowerCase());
  }

  if (filters.degreeLevel && filters.degreeLevel !== 'ALL') {
    sanitized = sanitized.filter((u) =>
      u.programs.some((p: any) => p.degreeLevel === filters.degreeLevel)
    );
  }

  if (filters.language && filters.language !== 'ALL') {
    sanitized = sanitized.filter((u) =>
      u.programs.some((p: any) => p.languageOfInstruction === filters.language)
    );
  }

  if (typeof filters.minTuition === 'number' && !Number.isNaN(filters.minTuition)) {
    sanitized = sanitized.filter((u) =>
      u.programs.some(
        (p: any) =>
          typeof p.tuitionAmount === 'number' &&
          p.tuitionCurrency === 'CNY' &&
          p.tuitionPeriod === 'ANNUALLY' &&
          p.tuitionAmount >= filters.minTuition!
      )
    );
  }

  if (typeof filters.maxTuition === 'number' && !Number.isNaN(filters.maxTuition)) {
    sanitized = sanitized.filter((u) =>
      u.programs.some(
        (p: any) =>
          typeof p.tuitionAmount === 'number' &&
          p.tuitionCurrency === 'CNY' &&
          p.tuitionPeriod === 'ANNUALLY' &&
          p.tuitionAmount <= filters.maxTuition!
      )
    );
  }

  if (filters.hasScholarship === true) {
    sanitized = sanitized.filter((u) => u.scholarships.length > 0);
  }

  if (filters.fundingType && filters.fundingType !== 'ALL') {
    sanitized = sanitized.filter((u) =>
      u.scholarships.some((s: any) => s.fundingType === filters.fundingType)
    );
  }

  if (filters.hasAccommodation === true) {
    sanitized = sanitized.filter(
      (u) => u.accommodationAvailable === true || u.accommodationGalleries.length > 0
    );
  }

  if (filters.applicationStatus && filters.applicationStatus !== 'ALL') {
    sanitized = sanitized.filter((u) => {
      const statuses = [
        ...u.deadlines.map((d: any) => d.evaluated.status),
        ...u.programs.map((p: any) => p.deadlineInfo.status),
      ];
      return statuses.includes(filters.applicationStatus);
    });
  }

  // Sorting
  const sortBy = filters.sortBy || 'name';
  sanitized.sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'deadline') {
      const aDates = [
        ...a.deadlines.map((d: any) => d.closingDate),
        ...a.programs.map((p: any) => p.deadlineDate),
      ]
        .filter(Boolean)
        .map((d) => new Date(d).getTime());
      const bDates = [
        ...b.deadlines.map((d: any) => d.closingDate),
        ...b.programs.map((p: any) => p.deadlineDate),
      ]
        .filter(Boolean)
        .map((d) => new Date(d).getTime());
      const aMin = aDates.length > 0 ? Math.min(...aDates) : Number.MAX_SAFE_INTEGER;
      const bMin = bDates.length > 0 ? Math.min(...bDates) : Number.MAX_SAFE_INTEGER;
      return aMin - bMin;
    }
    if (sortBy === 'tuition') {
      // Only compare comparable annual CNY tuition records
      const getMinComparableTuition = (u: any) => {
        const amounts = u.programs
          .filter((p: any) => typeof p.tuitionAmount === 'number' && p.tuitionCurrency === 'CNY' && p.tuitionPeriod === 'ANNUALLY')
          .map((p: any) => p.tuitionAmount as number);
        return amounts.length > 0 ? Math.min(...amounts) : Number.MAX_SAFE_INTEGER;
      };
      return getMinComparableTuition(a) - getMinComparableTuition(b);
    }
    return a.nameEn.localeCompare(b.nameEn);
  });

  const total = sanitized.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = sanitized.slice((page - 1) * pageSize, page * pageSize);

  // Extract available filter facets dynamically from published universities
  const allPublished = rawUniversities;
  const cities = Array.from(new Set(allPublished.map((u) => u.city).filter(Boolean) as string[])).sort();
  const provinces = Array.from(new Set(allPublished.map((u) => u.province).filter(Boolean) as string[])).sort();

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    facets: {
      cities,
      provinces,
    },
  };
}
