import React from 'react';
import { MessageCircle } from 'lucide-react';
import {
  WhatsAppConfigInput,
  WhatsAppVariables,
  buildWhatsAppContactAction,
} from '@/lib/whatsapp';
import { SupportedLocale } from '@/lib/i18n';

interface WhatsAppButtonProps {
  config: WhatsAppConfigInput;
  lang: SupportedLocale;
  universityId?: string | null;
  programId?: string | null;
  scholarshipId?: string | null;
  variables?: WhatsAppVariables;
  variant?: 'inline' | 'floating' | 'compact';
  customLabel?: string;
}

export function WhatsAppButton({
  config,
  lang,
  universityId,
  programId,
  scholarshipId,
  variables,
  variant = 'inline',
  customLabel,
}: WhatsAppButtonProps) {
  const action = buildWhatsAppContactAction({
    config,
    lang,
    universityId,
    programId,
    scholarshipId,
    variables,
  });

  // Rule 12 & Section 13.2: If number is missing/invalid or WhatsApp is disabled, hide the button completely!
  if (!action.visible || !action.href) {
    return null;
  }

  const label = customLabel || action.buttonText;

  if (variant === 'floating') {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 end-6 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 transition transform hover:scale-105"
        aria-label={label}
      >
        <MessageCircle className="h-5 w-5" />
        <span>{label}</span>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
    >
      <MessageCircle className="h-4 w-4" />
      <span>{label}</span>
    </a>
  );
}
