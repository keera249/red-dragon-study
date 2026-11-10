import React from 'react';
import { Mail, MapPin, Phone, Clock, Download, FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentLocale } from '@/lib/i18n-server';
import { UI_LABELS } from '@/lib/i18n';
import { getLocalizedText, hasNonEmptyText } from '@/lib/visibility';
import { generateUniversityCode, getPublicUniversityName } from '@/lib/university-code';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { InquiryFormClient } from '@/components/InquiryFormClient';

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getCurrentLocale(sp?.lang);
  const t = UI_LABELS[lang];

  const [sys, contact, waTemplates, universities, scholarships] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 'default' } }),
    prisma.contactSetting.findUnique({ where: { id: 'default' } }),
    prisma.whatsAppTemplate.findMany({ where: { isEnabled: true } }),
    prisma.university.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, nameEn: true, nameAr: true },
    }),
    prisma.scholarship.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, nameEn: true, nameAr: true },
    }),
  ]);

  const address = getLocalizedText(lang, contact?.addressAr, contact?.addressEn);
  const workingHours = getLocalizedText(lang, contact?.workingHoursAr, contact?.workingHoursEn);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                {t.nav.contact}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {lang === 'ar'
                  ? 'تواصل مع مستشارينا الأكاديميين للحصول على إرشاد موثق حول القبول والمنح الدراسية في الصين.'
                  : 'Connect with our academic advisors for verified guidance on Chinese university admissions and scholarships.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              {hasNonEmptyText(contact?.contactEmail) && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {lang === 'ar' ? 'البريد الإلكتروني الرسمي' : 'Official Email'}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {contact!.contactEmail}
                    </div>
                  </div>
                </div>
              )}

              {hasNonEmptyText(contact?.phoneDisplay) && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {lang === 'ar' ? 'رقم الهاتف' : 'Phone'}
                    </div>
                    <div className="text-sm font-semibold text-slate-900" dir="ltr">
                      {contact!.phoneDisplay}
                    </div>
                  </div>
                </div>
              )}

              {address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {lang === 'ar' ? 'العنوان' : 'Office Address'}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{address}</div>
                  </div>
                </div>
              )}

              {workingHours && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {lang === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{workingHours}</div>
                  </div>
                </div>
              )}

              {contact && (
                <div className="pt-2">
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
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{lang === 'ar' ? 'تحميل النماذج والاستمارات الرسمية' : 'Official Application Forms'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href="/forms/application-form.doc"
                    download="Red-Dragon-Study-Application-Form.doc"
                    className="inline-flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-brand-50 hover:border-brand-300 transition"
                  >
                    <span>{lang === 'ar' ? 'استمارة التقديم الرسمية (DOC)' : 'Application Form (DOC)'}</span>
                    <Download className="h-4 w-4 text-brand-700" />
                  </a>
                  <a
                    href="/forms/physical-examination-form.pdf"
                    download="Foreigner-Physical-Examination-Form-China.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:border-emerald-300 transition"
                  >
                    <span>{lang === 'ar' ? 'نموذج الفحص الطبي للأجانب (PDF)' : 'Medical Examination Form (PDF)'}</span>
                    <Download className="h-4 w-4 text-emerald-700" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">
                {lang === 'ar' ? 'نموذج الاستفسار الأكاديمي' : 'Student Admission Inquiry Form'}
              </h2>
              <InquiryFormClient
                lang={lang}
                universities={universities.map((u) => {
                  const uCode = generateUniversityCode(u);
                  return {
                    id: u.id,
                    nameEn: getPublicUniversityName(uCode, 'en'),
                    nameAr: getPublicUniversityName(uCode, 'ar'),
                  };
                })}
                scholarships={scholarships}
                privacyNotice={
                  getLocalizedText(lang, sys?.privacyNoticeAr, sys?.privacyNoticeEn) || undefined
                }
              />
            </div>
          </div>
        </div>
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
