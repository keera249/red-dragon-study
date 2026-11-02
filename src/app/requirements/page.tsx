import React from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { SupportedLocale, UI_LABELS } from '@/lib/i18n';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { OfficialDownloadsSection } from '@/components/OfficialDownloadsSection';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export const dynamic = 'force-dynamic';

export default async function RequirementsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const isAr = lang === 'ar';

  const [contact, waTemplates] = await Promise.all([
    prisma.contactSetting.findUnique({ where: { id: 'default' } }),
    prisma.whatsAppTemplate.findMany({ where: { isEnabled: true } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader lang={lang} />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white py-14 sm:py-20 border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isAr ? 'المستندات والنماذج الرسمية' : 'Official Requirements & Forms'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
              {isAr
                ? 'متطلبات التقديم واستمارة الفحص الطبي'
                : 'Admission Requirements & Official Forms'}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {isAr
                ? 'حمّل استمارة التقديم الرسمية ونموذج الفحص الطبي المعتمد للأجانب في الصين، واطلع على قائمة الوثائق المطلوبة لكل مرحلة أكاديمية.'
                : 'Download the certified Foreigner Physical Examination form and application documents, with complete checklists for all study levels.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/forms/application-form.doc"
                download="Red-Dragon-Study-Application-Form.doc"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-xs sm:text-sm font-extrabold text-brand-950 shadow-md hover:bg-amber-300 transition"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? 'تحميل استمارة التقديم (DOC)' : 'Download Application (DOC)'}</span>
              </a>
              <a
                href="/forms/physical-examination-form.pdf"
                download="Foreigner-Physical-Examination-Form-China.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-emerald-500 transition"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? 'تحميل نموذج الفحص الطبي (PDF)' : 'Download Medical Form (PDF)'}</span>
              </a>
              {contact && (
                <WhatsAppButton
                  config={{
                    globalWhatsappEnabled: contact.globalWhatsappEnabled,
                    defaultWhatsappNumber: contact.defaultWhatsappNumber,
                    defaultMessageEn: contact.defaultMessageEn,
                    defaultMessageAr: contact.defaultMessageAr,
                    buttonTextEn: contact.buttonTextEn,
                    buttonTextAr: contact.buttonTextAr,
                    templates: waTemplates,
                  }}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </section>

        {/* Detailed Downloads & Interactive Checklists */}
        <OfficialDownloadsSection lang={lang} />
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
