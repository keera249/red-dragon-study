'use client';

import React, { useState } from 'react';
import { CheckCircle2, Send, Shield } from 'lucide-react';
import { SupportedLocale, UI_LABELS } from '@/lib/i18n';

interface InquiryFormProps {
  lang: SupportedLocale;
  universities?: Array<{ id: string; nameEn: string; nameAr?: string | null }>;
  scholarships?: Array<{ id: string; nameEn: string; nameAr?: string | null }>;
  defaultUniversityId?: string;
  defaultProgramId?: string;
  defaultScholarshipId?: string;
  privacyNotice?: string;
}

export function InquiryFormClient({
  lang,
  universities = [],
  scholarships = [],
  defaultUniversityId = '',
  defaultProgramId = '',
  defaultScholarshipId = '',
  privacyNotice,
}: InquiryFormProps) {
  const t = UI_LABELS[lang].common;
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [countryOfResidence, setCountryOfResidence] = useState('');
  const [nationality, setNationality] = useState('');
  const [universityId, setUniversityId] = useState(defaultUniversityId);
  const [scholarshipId, setScholarshipId] = useState(defaultScholarshipId);
  const [intendedIntake, setIntendedIntake] = useState('Autumn 2027');
  const [currentQualification, setCurrentQualification] = useState('');
  const [message, setMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          email,
          whatsappNumber,
          countryOfResidence,
          nationality,
          universityId: universityId || null,
          programId: defaultProgramId || null,
          scholarshipId: scholarshipId || null,
          intendedIntake,
          currentQualification,
          message,
          privacyConsent,
          honeypot: '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed');
      } else {
        setSubmittedRef(data.inquiryNumber);
        setStudentName('');
        setEmail('');
        setWhatsappNumber('');
        setMessage('');
      }
    } catch {
      setError(lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب.' : 'Network error submitting inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRef) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold">
              {lang === 'ar' ? 'تم استلام استفسارك بنجاح!' : 'Inquiry Received Successfully!'}
            </h3>
            <p className="text-sm">
              {t.inquirySuccess} <strong className="font-mono">{submittedRef}</strong>
            </p>
            <button
              type="button"
              onClick={() => setSubmittedRef(null)}
              className="mt-2 inline-flex text-xs font-semibold text-emerald-800 underline"
            >
              {lang === 'ar' ? 'إرسال استفسار آخر' : 'Submit another inquiry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'ar' ? 'الاسم الكامل للطالب *' : 'Student Full Name *'}
          </label>
          <input
            type="text"
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'ar' ? 'البريد الإلكتروني *' : 'Contact Email *'}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'ar' ? 'رقم الواتساب (مع رمز الدولة) *' : 'WhatsApp Number (with country code) *'}
          </label>
          <input
            type="tel"
            required
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+966 50 000 0000"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'ar' ? 'بلد الإقامة الحالي' : 'Country of Residence'}
          </label>
          <input
            type="text"
            value={countryOfResidence}
            onChange={(e) => setCountryOfResidence(e.target.value)}
            placeholder={lang === 'ar' ? 'مثال: السعودية، مصر، الأردن...' : 'e.g. Saudi Arabia, UAE, Jordan...'}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'ar' ? 'الجنسية (اختياري)' : 'Nationality (Optional)'}
          </label>
          <input
            type="text"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'ar' ? 'المؤهل الدراسي الحالي' : 'Current Educational Qualification'}
          </label>
          <input
            type="text"
            value={currentQualification}
            onChange={(e) => setCurrentQualification(e.target.value)}
            placeholder={lang === 'ar' ? 'ثانوية عامة / بكالوريوس / ماجستير' : 'High School / Bachelor / Master'}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
          />
        </div>

        {universities.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ar' ? 'الجامعة المهتم بها' : 'University of Interest'}
            </label>
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
            >
              <option value="">{lang === 'ar' ? 'غير محدد / استشارة عامة' : 'Any / General Consultation'}</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {lang === 'ar' ? u.nameAr || u.nameEn : u.nameEn}
                </option>
              ))}
            </select>
          </div>
        )}

        {scholarships.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ar' ? 'المنحة الدراسية المهتم بها' : 'Scholarship of Interest'}
            </label>
            <select
              value={scholarshipId}
              onChange={(e) => setScholarshipId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
            >
              <option value="">{lang === 'ar' ? 'غير محدد' : 'None / Not Specified'}</option>
              {scholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'ar' ? s.nameAr || s.nameEn : s.nameEn}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {lang === 'ar' ? 'تفاصيل الاستفسار والتخصص المطلوب *' : 'Inquiry Message & Desired Program *'}
        </label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            lang === 'ar'
              ? 'اكتب التخصص المطلوب وأي استفسارات حول شروط القبول أو الرسوم أو المنح...'
              : 'Describe your desired major, degree level, and any questions regarding admission or scholarships...'
          }
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
        />
      </div>

      <div className="rounded-xl bg-slate-100 p-3.5 text-xs text-slate-600 space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
          />
          <span>
            {privacyNotice ||
              (lang === 'ar'
                ? 'أوافق على سياسة الخصوصية واستخدام بيانات التواصل الخاصة بي للرد على استفساري الأكاديمي فقط.'
                : 'I consent to the Privacy Policy and authorize Red Dragon Study to contact me regarding my academic inquiry.')}
          </span>
        </label>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Shield className="h-3.5 w-3.5 text-brand-700" />
          <span>
            {lang === 'ar'
              ? 'بياناتك محمية ولا تُعرض علناً أبداً.'
              : 'Your contact information is strictly confidential and never publicly exposed.'}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-50 transition"
      >
        <Send className="h-4 w-4" />
        <span>{submitting ? t.submitting : t.submitInquiry}</span>
      </button>
    </form>
  );
}
