export type ApplicationDeadlineStatus =
  | 'NOT_YET_OPEN'
  | 'OPEN'
  | 'DEADLINE_APPROACHING'
  | 'DEADLINE_PASSED'
  | 'DEADLINE_NOT_ANNOUNCED';

export interface DeadlineInput {
  openingDate?: Date | string | null;
  closingDate?: Date | string | null;
  timezone?: string | null;
  showNotAnnounced?: boolean | null;
  expiredBehavior?: 'KEEP_VISIBLE' | 'ARCHIVE' | 'UNPUBLISH' | string | null;
  status?: string | null;
}

export interface CalculatedDeadlineInfo {
  status: ApplicationDeadlineStatus;
  labelEn: string;
  labelAr: string;
  daysRemaining: number | null;
  shouldDisplayPublicly: boolean;
  formattedOpeningDate: string | null;
  formattedClosingDate: string | null;
}

function parseValidDate(d?: Date | string | null): Date | null {
  if (!d) return null;
  const parsed = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Formats a date in a consistent timezone (defaulting to Asia/Shanghai) without fabricating dates.
 */
export function formatDateInTimezone(
  date: Date | string | null | undefined,
  locale: 'ar' | 'en' = 'en',
  timezone = 'Asia/Shanghai'
): string | null {
  const parsed = parseValidDate(date);
  if (!parsed) return null;
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      timeZone: timezone || 'Asia/Shanghai',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(parsed);
  } catch {
    return parsed.toISOString().split('T')[0];
  }
}

/**
 * Calculates deadline status, days remaining, and whether the deadline should be displayed publicly.
 * Enforces Section 10:
 * - Never fabricates missing deadlines.
 * - If closingDate is missing, hides it unless showNotAnnounced is explicitly true.
 * - Respects expiredBehavior (KEEP_VISIBLE, ARCHIVE, UNPUBLISH).
 */
export function evaluateDeadline(
  input: DeadlineInput | null | undefined,
  options?: {
    now?: Date;
    warningDays?: number;
    locale?: 'ar' | 'en';
  }
): CalculatedDeadlineInfo {
  const now = options?.now ?? new Date();
  const warningDays = options?.warningDays ?? 30;
  const locale = options?.locale ?? 'en';
  const tz = input?.timezone || 'Asia/Shanghai';

  if (!input || (input.status && input.status !== 'PUBLISHED')) {
    return {
      status: 'DEADLINE_NOT_ANNOUNCED',
      labelEn: 'Deadline Not Announced',
      labelAr: 'لم يتم الإعلان عن الموعد النهائي',
      daysRemaining: null,
      shouldDisplayPublicly: false,
      formattedOpeningDate: null,
      formattedClosingDate: null,
    };
  }

  const opening = parseValidDate(input.openingDate);
  const closing = parseValidDate(input.closingDate);

  if (!closing) {
    return {
      status: 'DEADLINE_NOT_ANNOUNCED',
      labelEn: 'Deadline Not Announced',
      labelAr: 'لم يتم الإعلان عن الموعد النهائي',
      daysRemaining: null,
      shouldDisplayPublicly: input.showNotAnnounced === true,
      formattedOpeningDate: formatDateInTimezone(opening, locale, tz),
      formattedClosingDate: null,
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = closing.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / msPerDay);

  if (opening && now.getTime() < opening.getTime()) {
    return {
      status: 'NOT_YET_OPEN',
      labelEn: 'Not Yet Open',
      labelAr: 'لم يفتح التقديم بعد',
      daysRemaining,
      shouldDisplayPublicly: true,
      formattedOpeningDate: formatDateInTimezone(opening, locale, tz),
      formattedClosingDate: formatDateInTimezone(closing, locale, tz),
    };
  }

  if (diffMs < 0) {
    const expiredBehavior = input.expiredBehavior || 'KEEP_VISIBLE';
    const shouldDisplayPublicly = expiredBehavior === 'KEEP_VISIBLE';
    return {
      status: 'DEADLINE_PASSED',
      labelEn: 'Deadline Passed',
      labelAr: 'انتهى الموعد النهائي',
      daysRemaining,
      shouldDisplayPublicly,
      formattedOpeningDate: formatDateInTimezone(opening, locale, tz),
      formattedClosingDate: formatDateInTimezone(closing, locale, tz),
    };
  }

  if (daysRemaining <= warningDays) {
    return {
      status: 'DEADLINE_APPROACHING',
      labelEn: 'Deadline Approaching',
      labelAr: 'يقترب الموعد النهائي',
      daysRemaining,
      shouldDisplayPublicly: true,
      formattedOpeningDate: formatDateInTimezone(opening, locale, tz),
      formattedClosingDate: formatDateInTimezone(closing, locale, tz),
    };
  }

  return {
    status: 'OPEN',
    labelEn: 'Open',
    labelAr: 'التقديم مفتوح',
    daysRemaining,
    shouldDisplayPublicly: true,
    formattedOpeningDate: formatDateInTimezone(opening, locale, tz),
    formattedClosingDate: formatDateInTimezone(closing, locale, tz),
  };
}
