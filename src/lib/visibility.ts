export type ContentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'DISABLED'
  | 'ARCHIVED'
  | 'DELETED'
  | string;

/**
 * Checks if a record is publicly visible based on its publication status and enabled flag.
 * Distinguishes between DRAFT, PUBLISHED, UNPUBLISHED, DISABLED, ARCHIVED, and DELETED.
 */
export function isRecordPubliclyVisible(
  record: { status?: ContentStatus | null; isEnabled?: boolean | null; isDeleted?: boolean | null } | null | undefined,
  allowPreview = false
): boolean {
  if (!record) return false;
  if (record.isDeleted === true) return false;
  if (record.isEnabled === false) return false;
  const status = (record.status ?? 'PUBLISHED').toUpperCase();
  if ( status === 'DELETED' || status === 'DISABLED' || status === 'UNPUBLISHED' || status === 'ARCHIVED') {
    return false;
  }
  if (status === 'DRAFT') {
    return allowPreview;
  }
  return status === 'PUBLISHED';
}

/**
 * Checks if a string value is non-empty and safe for rendering.
 * Prevents rendering labels for empty optional fields.
 */
export function hasNonEmptyText(value: string | null | undefined): boolean {
  if (typeof value !== 'string') return false;
  return value.trim().length > 0;
}

/**
 * Resolves localized text with consistent fallback policy without displaying empty containers.
 */
export function getLocalizedText(
  lang: 'ar' | 'en',
  arValue?: string | null,
  enValue?: string | null
): string | null {
  const primary = lang === 'ar' ? arValue : enValue;
  const fallback = lang === 'ar' ? enValue : arValue;
  if (hasNonEmptyText(primary)) return primary!.trim();
  if (hasNonEmptyText(fallback)) return fallback!.trim();
  return null;
}

/**
 * Validates whether a URL is a valid HTTP/HTTPS URL so missing or broken URLs never produce buttons.
 */
export function isValidPublicUrl(url: string | null | undefined): boolean {
  if (!hasNonEmptyText(url)) return false;
  try {
    const parsed = new URL(url!.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Determines if map/location section should be visible.
 * Rule 10: Missing map information must not produce empty map containers.
 * Never invent coordinates.
 */
export function hasValidMapInformation(location: {
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  address?: string | null;
} | null | undefined): {
  canShowMapSection: boolean;
  hasCoordinates: boolean;
  hasDirectMapUrl: boolean;
  hasAddress: boolean;
} {
  if (!location) {
    return { canShowMapSection: false, hasCoordinates: false, hasDirectMapUrl: false, hasAddress: false };
  }
  const hasCoordinates =
    typeof location.latitude === 'number' &&
    !Number.isNaN(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    typeof location.longitude === 'number' &&
    !Number.isNaN(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180;

  const hasDirectMapUrl = isValidPublicUrl(location.mapUrl);
  const hasAddress = hasNonEmptyText(location.address);

  return {
    canShowMapSection: hasCoordinates || hasDirectMapUrl,
    hasCoordinates,
    hasDirectMapUrl,
    hasAddress,
  };
}

export interface GalleryImageInput {
  id: string;
  imageUrl?: string | null;
  isPublished?: boolean | null;
  displayOrder?: number | null;
  [key: string]: any;
}

export interface GalleryInput {
  id: string;
  status?: ContentStatus | null;
  isEnabled?: boolean | null;
  isAccommodation?: boolean | null;
  displayOrder?: number | null;
  images?: GalleryImageInput[] | null;
  [key: string]: any;
}

/**
 * Filters galleries and images according to Rules 6, 7, and 15:
 * - Only published & enabled galleries are eligible.
 * - Only published images with valid non-empty imageUrl are kept.
 * - Any gallery with 0 visible images is completely removed so no empty gallery heading,
 *   empty grid, disabled carousel, image counter, or placeholder ever renders.
 */
export function filterVisibleGalleries<T extends GalleryInput>(
  galleries: T[] | null | undefined,
  options?: { onlyAccommodation?: boolean; excludeAccommodation?: boolean; allowPreview?: boolean }
): Array<T & { images: GalleryImageInput[] }> {
  if (!Array.isArray(galleries) || galleries.length === 0) return [];

  const result: Array<T & { images: GalleryImageInput[] }> = [];

  for (const gallery of galleries) {
    if (!isRecordPubliclyVisible(gallery, options?.allowPreview)) continue;
    if (options?.onlyAccommodation && !gallery.isAccommodation) continue;
    if (options?.excludeAccommodation && gallery.isAccommodation) continue;

    const visibleImages = (gallery.images ?? [])
      .filter((img) => img && img.isPublished !== false && hasNonEmptyText(img.imageUrl))
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    if (visibleImages.length > 0) {
      result.push({
        ...gallery,
        images: visibleImages,
      });
    }
  }

  return result.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export interface ResolvedRequirementItem {
  id: string;
  source: 'SHARED' | 'UNIVERSITY_SPECIFIC';
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  instructionsEn: string | null;
  instructionsAr: string | null;
  supportingDocUrl: string | null;
  isRequired: boolean;
  displayOrder: number;
}

/**
 * Resolves shared requirements (with per-university overrides) and university-specific requirements.
 * Enforces Rules 8.2, 8.3, 8.4, and Rule 13:
 * - Unpublished, disabled, excluded, or empty requirements are hidden.
 * - Overrides apply strictly to the given university assignment.
 * - Returns empty array if no visible requirements exist, allowing caller to hide the entire section.
 */
export function resolveUniversityRequirements(
  sharedAssignments: Array<{
    id: string;
    displayOrder?: number | null;
    isEnabled?: boolean | null;
    status?: string | null;
    requirement?: {
      id: string;
      nameEn?: string | null;
      nameAr?: string | null;
      descriptionEn?: string | null;
      descriptionAr?: string | null;
      instructionsEn?: string | null;
      instructionsAr?: string | null;
      supportingDocUrl?: string | null;
      isRequiredDefault?: boolean | null;
      isEnabled?: boolean | null;
      status?: string | null;
    } | null;
    override?: {
      isRequiredOverride?: boolean | null;
      customNameEn?: string | null;
      customNameAr?: string | null;
      customDescriptionEn?: string | null;
      customDescriptionAr?: string | null;
      customInstructionsEn?: string | null;
      customInstructionsAr?: string | null;
      customSupportingDocUrl?: string | null;
      isExcluded?: boolean | null;
    } | null;
  }> | null | undefined,
  specificRequirements: Array<{
    id: string;
    nameEn?: string | null;
    nameAr?: string | null;
    descriptionEn?: string | null;
    descriptionAr?: string | null;
    instructionsEn?: string | null;
    instructionsAr?: string | null;
    supportingDocUrl?: string | null;
    isRequired?: boolean | null;
    displayOrder?: number | null;
    isEnabled?: boolean | null;
    status?: string | null;
  }> | null | undefined
): ResolvedRequirementItem[] {
  const items: ResolvedRequirementItem[] = [];

  for (const assign of sharedAssignments ?? []) {
    if (!isRecordPubliclyVisible(assign)) continue;
    const req = assign.requirement;
    if (!req || !isRecordPubliclyVisible(req)) continue;
    const ov = assign.override;
    if (ov?.isExcluded === true) continue;

    const nameEn = hasNonEmptyText(ov?.customNameEn) ? ov!.customNameEn!.trim() : (req.nameEn ?? '').trim();
    const nameAr = hasNonEmptyText(ov?.customNameAr) ? ov!.customNameAr!.trim() : (req.nameAr?.trim() || null);

    if (!hasNonEmptyText(nameEn) && !hasNonEmptyText(nameAr)) continue;

    items.push({
      id: assign.id,
      source: 'SHARED',
      nameEn: nameEn || nameAr || '',
      nameAr,
      descriptionEn: hasNonEmptyText(ov?.customDescriptionEn)
        ? ov!.customDescriptionEn!.trim()
        : (req.descriptionEn?.trim() || null),
      descriptionAr: hasNonEmptyText(ov?.customDescriptionAr)
        ? ov!.customDescriptionAr!.trim()
        : (req.descriptionAr?.trim() || null),
      instructionsEn: hasNonEmptyText(ov?.customInstructionsEn)
        ? ov!.customInstructionsEn!.trim()
        : (req.instructionsEn?.trim() || null),
      instructionsAr: hasNonEmptyText(ov?.customInstructionsAr)
        ? ov!.customInstructionsAr!.trim()
        : (req.instructionsAr?.trim() || null),
      supportingDocUrl: isValidPublicUrl(ov?.customSupportingDocUrl)
        ? ov!.customSupportingDocUrl!.trim()
        : isValidPublicUrl(req.supportingDocUrl)
        ? req.supportingDocUrl!.trim()
        : null,
      isRequired:
        typeof ov?.isRequiredOverride === 'boolean'
          ? ov.isRequiredOverride
          : req.isRequiredDefault !== false,
      displayOrder: assign.displayOrder ?? 0,
    });
  }

  for (const spec of specificRequirements ?? []) {
    if (!isRecordPubliclyVisible(spec)) continue;
    const nameEn = (spec.nameEn ?? '').trim();
    const nameAr = spec.nameAr?.trim() || null;
    if (!hasNonEmptyText(nameEn) && !hasNonEmptyText(nameAr)) continue;

    items.push({
      id: spec.id,
      source: 'UNIVERSITY_SPECIFIC',
      nameEn: nameEn || nameAr || '',
      nameAr,
      descriptionEn: spec.descriptionEn?.trim() || null,
      descriptionAr: spec.descriptionAr?.trim() || null,
      instructionsEn: spec.instructionsEn?.trim() || null,
      instructionsAr: spec.instructionsAr?.trim() || null,
      supportingDocUrl: isValidPublicUrl(spec.supportingDocUrl) ? spec.supportingDocUrl!.trim() : null,
      isRequired: spec.isRequired !== false,
      displayOrder: spec.displayOrder ?? 100,
    });
  }

  return items.sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Filters scholarships so that only PUBLISHED scholarships with valid names are returned.
 * Rule 8: Scholarship sections with no applicable published scholarships must be hidden.
 */
export function filterVisibleScholarships<
  T extends { status?: string | null; nameEn?: string | null; nameAr?: string | null }
>(scholarships: T[] | null | undefined, allowPreview = false): T[] {
  if (!Array.isArray(scholarships)) return [];
  return scholarships.filter(
    (s) =>
      isRecordPubliclyVisible(s, allowPreview) &&
      (hasNonEmptyText(s.nameEn) || hasNonEmptyText(s.nameAr))
  );
}

/**
 * Checks if a parent section has at least one visible child element.
 * Rule 15: Parent sections containing no visible child elements must be hidden.
 */
export function shouldRenderSectionWithChildren<T>(
  sectionEnabled: boolean | null | undefined,
  sectionStatus: string | null | undefined,
  visibleChildren: T[] | null | undefined,
  allowPreview = false
): boolean {
  if (!isRecordPubliclyVisible({ isEnabled: sectionEnabled, status: sectionStatus }, allowPreview)) {
    return false;
  }
  if (!Array.isArray(visibleChildren) || visibleChildren.length === 0) {
    return false;
  }
  return true;
}
