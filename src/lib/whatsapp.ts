export interface WhatsAppVariables {
  university_name?: string | null;
  major_name?: string | null;
  city?: string | null;
  scholarship_name?: string | null;
  application_deadline?: string | null;
  page_url?: string | null;
}

export interface WhatsAppTemplateCandidate {
  id?: string;
  scope: 'GLOBAL' | 'UNIVERSITY' | 'PROGRAM' | 'SCHOLARSHIP' | string;
  universityId?: string | null;
  programId?: string | null;
  scholarshipId?: string | null;
  whatsappNumberOverride?: string | null;
  templateEn: string;
  templateAr?: string | null;
  isEnabled?: boolean | null;
}

export interface WhatsAppConfigInput {
  globalWhatsappEnabled?: boolean | null;
  defaultWhatsappNumber?: string | null;
  universityWhatsappNumber?: string | null;
  defaultMessageEn?: string | null;
  defaultMessageAr?: string | null;
  buttonTextEn?: string | null;
  buttonTextAr?: string | null;
  templates?: WhatsAppTemplateCandidate[];
}

/**
 * Validates and normalizes a phone number for WhatsApp wa.me links.
 * Returns null if missing or invalid.
 */
export function normalizeWhatsAppNumber(rawNumber?: string | null): string | null {
  if (!rawNumber || typeof rawNumber !== 'string') return null;
  const digits = rawNumber.replace(/[^\d]/g, '');
  if (digits.length < 7 || digits.length > 15) {
    return null;
  }
  return digits;
}

/**
 * Populates variables in a WhatsApp message template and gracefully strips any
 * unresolved placeholders so raw "{variable}" strings never appear.
 */
export function renderWhatsAppMessage(
  template: string,
  variables: WhatsAppVariables,
  lang: 'ar' | 'en' = 'en'
): string {
  if (!template || !template.trim()) {
    return lang === 'ar'
      ? 'مرحباً، أود الاستفسار عن الدراسة في الصين.'
      : 'Hello, I would like more information about studying in China.';
  }

  let message = template;

  // Clean sentences that purely depend on missing variables before general replacement
  if (!variables.major_name || !variables.major_name.trim()) {
    message = message.replace(/\s*I am interested in \{major_name\}\./gi, '');
    message = message.replace(/\s*for the \{major_name\} program/gi, '');
    message = message.replace(/\s*في تخصص \{major_name\}/g, '');
  }
  if (!variables.scholarship_name || !variables.scholarship_name.trim()) {
    message = message.replace(/\s*regarding \{scholarship_name\}/gi, '');
    message = message.replace(/\s*بخصوص منحة \{scholarship_name\}/g, '');
  }
  if (!variables.city || !variables.city.trim()) {
    message = message.replace(/\s*in \{city\}/gi, '');
    message = message.replace(/\s*في مدينة \{city\}/g, '');
  }
  if (!variables.application_deadline || !variables.application_deadline.trim()) {
    message = message.replace(/\s*\(Deadline:\s*\{application_deadline\}\)/gi, '');
  }

  const replacements: Record<string, string> = {
    university_name: variables.university_name?.trim() || (lang === 'ar' ? 'الجامعة' : 'the university'),
    major_name: variables.major_name?.trim() || '',
    city: variables.city?.trim() || '',
    scholarship_name: variables.scholarship_name?.trim() || '',
    application_deadline: variables.application_deadline?.trim() || '',
    page_url: variables.page_url?.trim() || '',
  };

  for (const [key, val] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    message = message.replace(regex, val);
  }

  // Strip any remaining unknown or unresolved {placeholder} tokens
  message = message.replace(/\{[a-zA-Z0-9_]+\}/g, '');

  // Clean up duplicate spaces or awkward punctuation left by empty tokens
  message = message
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\.\./g, '.')
    .trim();

  return message;
}

/**
 * Resolves the complete WhatsApp contact action (visibility, phone number, pre-filled message, and encoded URL).
 */
export function buildWhatsAppContactAction(params: {
  config: WhatsAppConfigInput;
  lang: 'ar' | 'en';
  universityId?: string | null;
  programId?: string | null;
  scholarshipId?: string | null;
  variables?: WhatsAppVariables;
}): {
  visible: boolean;
  phoneNumber: string | null;
  message: string;
  href: string | null;
  buttonText: string;
} {
  const { config, lang, universityId, programId, scholarshipId, variables = {} } = params;

  const defaultBtnText = lang === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp';
  const buttonText =
    (lang === 'ar' ? config.buttonTextAr : config.buttonTextEn)?.trim() || defaultBtnText;

  if (config.globalWhatsappEnabled === false) {
    return { visible: false, phoneNumber: null, message: '', href: null, buttonText };
  }

  const enabledTemplates = (config.templates ?? []).filter((t) => t.isEnabled !== false);

  // Precedence: 1. Program match -> 2. Scholarship match -> 3. University match -> 4. Global template -> 5. Default fallback
  let matchedTemplate: WhatsAppTemplateCandidate | undefined;
  if (programId) {
    matchedTemplate = enabledTemplates.find(
      (t) => t.scope === 'PROGRAM' && t.programId === programId
    );
  }
  if (!matchedTemplate && scholarshipId) {
    matchedTemplate = enabledTemplates.find(
      (t) => t.scope === 'SCHOLARSHIP' && t.scholarshipId === scholarshipId
    );
  }
  if (!matchedTemplate && universityId) {
    matchedTemplate = enabledTemplates.find(
      (t) => t.scope === 'UNIVERSITY' && t.universityId === universityId
    );
  }
  if (!matchedTemplate) {
    matchedTemplate = enabledTemplates.find((t) => t.scope === 'GLOBAL');
  }

  const rawNumber =
    matchedTemplate?.whatsappNumberOverride ||
    config.universityWhatsappNumber ||
    config.defaultWhatsappNumber;

  const phoneNumber = normalizeWhatsAppNumber(rawNumber);
  if (!phoneNumber) {
    return { visible: false, phoneNumber: null, message: '', href: null, buttonText };
  }

  const rawTemplate = matchedTemplate
    ? lang === 'ar'
      ? matchedTemplate.templateAr || matchedTemplate.templateEn
      : matchedTemplate.templateEn
    : lang === 'ar'
    ? config.defaultMessageAr || config.defaultMessageEn || ''
    : config.defaultMessageEn || '';

  const message = renderWhatsAppMessage(rawTemplate, variables, lang);
  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return {
    visible: true,
    phoneNumber,
    message,
    href,
    buttonText,
  };
}
