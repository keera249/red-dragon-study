'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ExternalLink,
  BookOpen,
  FileCheck2,
} from 'lucide-react';
import { SupportedLocale } from '@/lib/i18n';

interface OfficialDownloadsSectionProps {
  lang: SupportedLocale;
}

export function OfficialDownloadsSection({ lang }: OfficialDownloadsSectionProps) {
  const [activeTab, setActiveTab] = useState<'bachelor' | 'master' | 'language'>('bachelor');

  const isAr = lang === 'ar';

  const requirementsByLevel = {
    bachelor: [
      { id: '01', titleAr: 'شهادة الثانوية العامة موثقة ومترجمة', titleEn: 'High School Diploma (Attested & Translated)' },
      { id: '02', titleAr: 'جواز السفر (ساري المفعول لمدة سنة على الأقل)', titleEn: 'Valid Passport (Minimum 1 year validity)' },
      { id: '03', titleAr: 'استمارة الفحص الطبي للأجانب في الصين', titleEn: 'Foreigner Physical Examination Form' },
      { id: '04', titleAr: 'شهادة السجل الجنائي (شهادة حسن السيرة / الفيش)', titleEn: 'Non-Criminal Record Certificate (Police Clearance)' },
      { id: '05', titleAr: 'صورة شخصية رسمية حديثة بخلفية بيضاء', titleEn: 'Recent Passport-size Photograph (White Background)' },
      { id: '06', titleAr: 'استمارة التقديم الرسمية الخاصة بالمكتب', titleEn: 'Completed Red Dragon Application Form' },
      { id: '07', titleAr: 'شهادة امتحان CSCA (للتخصصات التي تتطلبها)', titleEn: 'CSCA Exam Certificate (For required programs)' },
    ],
    master: [
      { id: '01', titleAr: 'شهادة البكالوريوس مع بيان الدرجات الموثق', titleEn: 'Bachelor Degree Certificate & Official Transcripts' },
      { id: '02', titleAr: 'جواز السفر (ساري المفعول)', titleEn: 'Valid Passport' },
      { id: '03', titleAr: 'استمارة الفحص الطبي للأجانب في الصين', titleEn: 'Foreigner Physical Examination Form' },
      { id: '04', titleAr: 'شهادة السجل الجنائي (الفيش الجنائي)', titleEn: 'Non-Criminal Record / Police Clearance' },
      { id: '05', titleAr: 'صورة شخصية حديثة بخلفية بيضاء', titleEn: 'Passport Photograph (White Background)' },
      { id: '06', titleAr: 'استمارة التقديم الرسمية المعتمدة', titleEn: 'Official Red Dragon Application Form' },
      { id: '07', titleAr: 'خطابا توصية من أساتذة جامعيين (Two Recommendation Letters)', titleEn: 'Two Academic Recommendation Letters (Professors)' },
      { id: '08', titleAr: 'السيرة الذاتية الأكاديمية (Curriculum Vitae - CV)', titleEn: 'Updated Academic Curriculum Vitae (CV)' },
      { id: '09', titleAr: 'خطة الدراسة أو مقترح البحث (Study Plan / Research Proposal)', titleEn: 'Detailed Study Plan or Research Proposal (800+ words)' },
    ],
    language: [
      { id: '01', titleAr: 'شهادة الثانوية العامة أو المؤهل الحالي', titleEn: 'High School Certificate or Highest Qualification' },
      { id: '02', titleAr: 'جواز السفر ساري المفعول', titleEn: 'Valid Passport' },
      { id: '03', titleAr: 'استمارة الفحص الطبي للأجانب', titleEn: 'Foreigner Physical Examination Form' },
      { id: '04', titleAr: 'شهادة حسن السيرة والسلوك (الفيش الجنائي)', titleEn: 'Police Clearance Certificate' },
      { id: '05', titleAr: 'صورة شخصية رسمية بخلفية بيضاء', titleEn: 'Passport-size Photo (White Background)' },
      { id: '06', titleAr: 'استمارة التقديم الرسمية المكتملة', titleEn: 'Completed Application Form' },
    ],
  };

  return (
    <section id="downloads" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5 text-xs font-extrabold text-brand-800 uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>{isAr ? 'النماذج والمستندات الرسمية المعتمدة' : 'Official Application Documents & Forms'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {isAr
              ? 'حمّل استمارة التقديم والفحص الطبي الرسمي'
              : 'Download Official Application & Medical Forms'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {isAr
              ? 'نوفر لك النماذج الرسمية المعتمدة لدى الجامعات الصينية والسفارة الصينية لتجهيز ملفك الأكاديمي بسلاسة ودقة.'
              : 'Directly download the official application forms and the certified Foreigner Physical Examination form required for Chinese university admissions and student visas.'}
          </p>
        </div>

        {/* Primary Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Card 1: Application Form */}
          <div className="relative group rounded-3xl border-2 border-brand-100 bg-white p-7 sm:p-9 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-brand-500 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
                  <FileText className="h-3.5 w-3.5" />
                  {isAr ? 'ملف وورد • DOC (67 KB)' : 'Word Document • DOC (67 KB)'}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                  {isAr ? 'محدث للعام الدراسي 2026' : 'Updated 2026'}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                {isAr ? 'استمارة التقديم الرسمية للجامعات' : 'Official University Application Form'}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? 'استمارة التقديم المعتمدة من مكتب Red Dragon Study، تشمل كافة البيانات الشخصية، المسار الأكاديمي، الجامعات المفضلة، والمؤهلات السابقة.'
                  : 'Official applicant information form used to record academic qualifications, preferred cities, chosen study paths, and student background details.'}
              </p>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{isAr ? 'إرشادات التعبئة:' : 'Instructions:'}</span>
                </div>
                <p>
                  {isAr
                    ? '1. قم بتنزيل الملف وتعبئته باللغة الإنجليزية أو الصينية.\n2. تأكد من مطابقة الاسم الكامل لجواز السفر بدقة.\n3. أعد إرسال الاستمارة لنا عبر الواتساب أو صفحة التواصل.'
                    : '1. Download and complete the form in English or Chinese. 2. Ensure your full name matches your passport exactly. 3. Return it via WhatsApp or our contact form.'}
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <a
                href="/forms/application-form.doc"
                download="Red-Dragon-Study-Application-Form.doc"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-brand-800 transition active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? 'تحميل استمارة التقديم (DOC)' : 'Download Application Form (DOC)'}</span>
              </a>
            </div>
          </div>

          {/* Card 2: Foreigner Physical Examination Form */}
          <div className="relative group rounded-3xl border-2 border-emerald-100 bg-white p-7 sm:p-9 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-500 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  {isAr ? 'نموذج PDF رسمي • (138 KB)' : 'Official PDF Form • (138 KB)'}
                </span>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-full px-2.5 py-0.5">
                  {isAr ? 'إلزامي للفيزا والجامعات' : 'Mandatory for Visa & Universities'}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                {isAr ? 'نموذج الفحص الطبي للأجانب في الصين' : 'Foreigner Physical Examination Form'}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? 'الاستمارة الطبية القياسية الصادرة عن مصلحة الفحص الصحي والحجر الصحي في الصين، والمطلوبة لجميع الطلاب الدوليين للتقديم الجامعي وتأشيرة الدراسة (JW202 / X1).'
                  : 'The standard statutory medical examination form required by Chinese higher education authorities and Chinese embassies for student visa processing.'}
              </p>

              <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-700" />
                  <span>{isAr ? 'تنبيهات هامة للفحص الطبي:' : 'Crucial Medical Guidelines:'}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>{isAr ? 'يجب طباعة الاستمارة على صفحتين (وجه وظهر) وتعبئتها في مستشفى حكومي معتمد.' : 'Print double-sided and have it completed by a certified hospital or clinic.'}</li>
                  <li>{isAr ? 'ختم المستشفى يجب أن يوضع فوق الصورة الشخصية وفي الصفحة الأخيرة.' : 'Hospital official seal must overlap the photo and be placed at the bottom signature.'}</li>
                  <li>{isAr ? 'مدة صلاحية الفحص الطبي 6 أشهر فقط من تاريخ إجرائه.' : 'Medical examination validity is 6 months from the test date.'}</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <a
                href="/forms/physical-examination-form.pdf"
                download="Foreigner-Physical-Examination-Form-China.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-emerald-800 transition active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? 'تحميل نموذج الفحص الطبي (PDF)' : 'Download Medical Form (PDF)'}</span>
              </a>
            </div>
          </div>

        </div>

        {/* CSCA Exam Section & Syllabus Downloads */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-10 shadow-sm mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 mb-2">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{isAr ? 'اختبار القبول التنافسي للجامعات' : 'Competitive University Admissions'}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {isAr ? 'مقررات اختبار CSCA للجامعات الصينية (2025)' : 'CSCA Exam Syllabuses (2025 Release)'}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {isAr
                  ? 'اختبار CSCA هو امتحان القبول المعياري المعتمد لدى نخبة الجامعات الصينية لتقييم المتقدمين لبرامج البكالوريوس. يمكنك تنزيل المناهج الرسمية للاستعداد:'
                  : 'The CSCA is a standardized entrance assessment widely utilized by top-tier Chinese universities. Download the official syllabuses to prepare in advance:'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/forms/csca/CSCA-Mathematics-Syllabus-2025.pdf"
              download="CSCA-Mathematics-Syllabus-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  MATH
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-800 transition">
                    {isAr ? 'مقرر الرياضيات' : 'Mathematics Syllabus'}
                  </h4>
                  <span className="text-[11px] text-slate-500">PDF • 122 KB</span>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-400 group-hover:text-brand-700 transition" />
            </a>

            <a
              href="/forms/csca/CSCA-Physics-Syllabus-2025.pdf"
              download="CSCA-Physics-Syllabus-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  PHYS
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-800 transition">
                    {isAr ? 'مقرر الفيزياء' : 'Physics Syllabus'}
                  </h4>
                  <span className="text-[11px] text-slate-500">PDF • 124 KB</span>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-400 group-hover:text-brand-700 transition" />
            </a>

            <a
              href="/forms/csca/CSCA-Chemistry-Syllabus-2025.pdf"
              download="CSCA-Chemistry-Syllabus-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  CHEM
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-800 transition">
                    {isAr ? 'مقرر الكيمياء' : 'Chemistry Syllabus'}
                  </h4>
                  <span className="text-[11px] text-slate-500">PDF • 122 KB</span>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-400 group-hover:text-brand-700 transition" />
            </a>
          </div>
        </div>

        {/* Requirements Checklist Tabs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 block">
                {isAr ? 'قائمة المستندات المطلوبة للتقديم' : 'Complete Document Checklist'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {isAr ? 'ما الذي يجب تجهيزه قبل بدء التقديم؟' : 'What to prepare before applying?'}
              </h3>
            </div>

            {/* Level Switcher */}
            <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('bachelor')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'bachelor'
                    ? 'bg-white text-brand-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'البكالوريوس' : 'Bachelor'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('master')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'master'
                    ? 'bg-white text-brand-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'الماجستير' : 'Master'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('language')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'language'
                    ? 'bg-white text-brand-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'سنة اللغة والتحضيرية' : 'Language / Prep'}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirementsByLevel[activeTab].map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-xs font-black text-white">
                  {item.id}
                </div>
                <div className="text-sm font-bold text-slate-800 pt-0.5">
                  {isAr ? item.titleAr : item.titleEn}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-brand-50/80 p-5 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-brand-900">
              <span className="font-bold">{isAr ? 'هل جهزت ملفك وترغب في المراجعة المجانية؟' : 'Ready with your files?'}</span>{' '}
              {isAr
                ? 'تواصل مع فريق القبول عبر واتساب وسنقوم بمراجعة أوراقك واعتمادها قبل التقديم الرسمي.'
                : 'Send your documents to our admissions advisors on WhatsApp for free verification.'}
            </div>
            <a
              href="https://wa.me/8615518309290?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20Red%20Dragon%20Study%20%F0%9F%87%A8%F0%9F%87%B3%20%D9%82%D9%85%D8%AA%20%D8%A8%D8%AA%D8%AD%D9%85%D9%8A%D9%84%20%D8%A7%D9%84%D9%86%D9%85%D8%A7%D8%B0%D8%AC%20%D9%88%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D9%85%D8%B1%D8%A7%D8%AC%D8%B9%D8%A9%20%D9%85%D9%84%D9%81%D9%8A%20%D9%84%D9%84%D8%AA%D9%82%D8%AF%D9%8A%D9%85."
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-800 transition"
            >
              {isAr ? 'إرسال الملف عبر واتساب ←' : 'Submit via WhatsApp →'}
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
