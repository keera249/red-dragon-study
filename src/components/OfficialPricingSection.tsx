'use client';

import React from 'react';
import { Check, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { SupportedLocale } from '@/lib/i18n';

interface OfficialPricingSectionProps {
  lang: SupportedLocale;
}

export function OfficialPricingSection({ lang }: OfficialPricingSectionProps) {
  const isAr = lang === 'ar';

  const packages = [
    {
      id: 'lang',
      titleAr: 'سنة اللغة الصينية والسنة التحضيرية',
      titleEn: 'Chinese Language & Preparatory Year',
      code: 'LANGUAGE_YEAR',
      priceUSD: '500',
      badgeAr: 'تأسيس شامل',
      badgeEn: 'Full Foundation',
      isPopular: false,
      descAr: 'سنة لغة صينية شاملة، وتتضمن برنامج السنة التحضيرية المؤهلة للقبول الجامعي بنفس التكلفة.',
      descEn: 'Comprehensive Chinese language training including university preparatory program at a flat rate.',
      featuresAr: [
        'دراسة مكثفة للغة الصينية في جامعات معتمدة',
        'تشمل السنة التحضيرية للالتحاق بالبكالوريوس',
        'تجهيز ملف القبول والتسجيل المباشر',
        'استخراج إشعار القبول الرسمي ونموذج JW202',
        'مساعدة في إجراءات تأشيرة الدراسة X1/X2',
      ],
      featuresEn: [
        'Intensive Mandarin language instruction at accredited universities',
        'Includes university preparatory tracks',
        'Complete admission file setup and submission',
        'Official Admission Notice & JW202 processing support',
        'Student Visa (X1/X2) advisory & documentation',
      ],
    },
    {
      id: 'bachelor-1',
      titleAr: 'البكالوريوس — جامعة واحدة',
      titleEn: 'Bachelor Degree — 1 University',
      code: 'BACHELOR_1',
      priceUSD: '600',
      badgeAr: 'مسار مباشر',
      badgeEn: 'Direct Track',
      isPopular: false,
      descAr: 'تقديم ومتابعة لملف مرحلة البكالوريوس في جامعة صينية واحدة من اختيارك.',
      descEn: 'Submission and end-to-end follow up for a Bachelor degree at one chosen Chinese university.',
      featuresAr: [
        'التقديم على تخصص البكالوريوس المطلوب',
        'متابعة ومراجعة دقيقة لملف التقديم ووثائق CSCA',
        'متابعة حالة الطلب مباشرة مع قسم القبول الدولي',
        'استخراج القبول الجامعي المبدئي والنهائي',
        'إرشادات الفحص الطبي والسفارة الصينية',
      ],
      featuresEn: [
        'Application to your chosen undergraduate major',
        'Verification of transcripts and CSCA materials',
        'Direct coordination with university international office',
        'Acquisition of pre-admission & final official acceptance',
        'Medical exam and embassy visa guidelines',
      ],
    },
    {
      id: 'bachelor-3',
      titleAr: 'البكالوريوس — 3 جامعات صينية',
      titleEn: 'Bachelor Degree — 3 Universities',
      code: 'BACHELOR_3',
      priceUSD: '800',
      badgeAr: 'الأكثر طلباً • أفضل قيمة',
      badgeEn: 'Most Popular • Best Value',
      isPopular: true,
      descAr: 'تقديم متزامن ومتابعة لـ 3 جامعات صينية لرفع فرصة القبول الأكاديمي والمنح الدراسية لأعلى نسبة ممكنة.',
      descEn: 'Parallel applications and tracking across 3 universities to maximize admission probability and scholarship chances.',
      featuresAr: [
        'التقديم على 3 جامعات صينية مرموقة',
        'فرصة مضاعفة للحصول على منح دراسية وتخفيضات',
        'ترتيب رغبات المدن والتخصصات وفق الأفضلية',
        'متابعة مستمرة ومباشرة لكل ملف على حدة',
        'إشراف كامل حتى وصول القبول النهائي والتأشيرة',
      ],
      featuresEn: [
        'Simultaneous submission to 3 top-tier Chinese universities',
        'Maximized probability for institutional & municipal scholarships',
        'Strategic city and major prioritization',
        'Dedicated tracking for each individual application',
        'Full mentorship through final acceptance & visa issuance',
      ],
    },
    {
      id: 'master',
      titleAr: 'الماجستير والدراسات العليا',
      titleEn: 'Master Degree & Postgraduate',
      code: 'MASTER',
      priceUSD: '600',
      badgeAr: 'بحث متقدم',
      badgeEn: 'Advanced Research',
      isPopular: false,
      descAr: 'تقديم ومتابعة احترافية لملف الماجستير وفق متطلبات التخصص، المشرف الأكاديمي، وخطة البحث.',
      descEn: 'Professional submission for postgraduate degrees tailored to department, supervisor, and study plan criteria.',
      featuresAr: [
        'مراجعة وتنسيق السيرة الذاتية وخطة البحث (Study Plan)',
        'المساعدة في متطلبات خطابات التوصية الأكاديمية',
        'التقديم على برامج الماجستير باللغة الإنجليزية أو الصينية',
        'متابعة القبول وتأكيد المشرف الأكاديمي',
        'استخراج وثائق الفيزا والقبول الدولي',
      ],
      featuresEn: [
        'Review and optimization of CV & Study Plan / Research Proposal',
        'Guidance on academic recommendation letters',
        'Application to English-taught or Chinese-taught Master tracks',
        'Tracking faculty and academic supervisor confirmation',
        'JW202 and embassy visa package delivery',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>{isAr ? 'باقات واضحة وبدون تعقيد' : 'Transparent Pricing Packages'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'اختر الباقة المناسبة لمسارك الدراسي' : 'Choose Your Admission Service Package'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            {isAr
              ? 'أسعار ثابتة وخدمات محددة بشفافية تامة من Red Dragon Study بدون أي رسوم خفية.'
              : 'Clear service tiers and transparent pricing for higher education admissions in China.'}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                pkg.isPopular
                  ? 'border-2 border-brand-700 bg-brand-900 text-white shadow-xl scale-[1.02]'
                  : 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                      pkg.isPopular
                        ? 'bg-amber-400 text-brand-950'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isAr ? pkg.badgeAr : pkg.badgeEn}
                  </span>
                </div>

                <h3 className={`text-xl font-extrabold mb-2 ${pkg.isPopular ? 'text-white' : 'text-slate-900'}`}>
                  {isAr ? pkg.titleAr : pkg.titleEn}
                </h3>

                <p className={`text-xs mb-6 leading-relaxed ${pkg.isPopular ? 'text-slate-200' : 'text-slate-500'}`}>
                  {isAr ? pkg.descAr : pkg.descEn}
                </p>

                <div className="mb-6 pb-6 border-b border-white/15">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black">${pkg.priceUSD}</span>
                    <span className={`text-xs font-semibold ${pkg.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                      {isAr ? '/ رسوم الخدمة والمتابعة' : '/ Service Fee'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs mb-8">
                  {(isAr ? pkg.featuresAr : pkg.featuresEn).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${pkg.isPopular ? 'text-amber-400' : 'text-emerald-600'}`} />
                      <span className={pkg.isPopular ? 'text-slate-200' : 'text-slate-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <a
                  href={`https://wa.me/8615518309290?text=${encodeURIComponent(
                    isAr
                      ? `مرحباً Red Dragon Study 🇨🇳 أود التقديم على: ${pkg.titleAr} ($${pkg.priceUSD})`
                      : `Hello Red Dragon Study 🇨🇳 I would like to apply for: ${pkg.titleEn} ($${pkg.priceUSD})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center rounded-2xl py-3 px-4 text-xs font-black shadow transition ${
                    pkg.isPopular
                      ? 'bg-amber-400 text-brand-950 hover:bg-amber-300'
                      : 'bg-brand-700 text-white hover:bg-brand-800'
                  }`}
                >
                  {isAr ? 'ابدأ التقديم على الباقة ←' : 'Start Application →'}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Official Application Fee Notice (Extracted from official site) */}
        <div className="rounded-3xl bg-amber-50/90 border border-amber-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
              <ShieldCheck className="h-5 w-5 text-amber-700" />
              <span>{isAr ? 'ملاحظة رسمية مهمة بشأن رسوم التسجيل الجامعي:' : 'Important University Registration Fee Policy:'}</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              {isAr
                ? 'رسوم خدمة المكتب لا تشمل رسوم فحص الملف والتسجيل في الجامعة (Application Fee)، ويجب على الطالب دفع رسوم التسجيل بنفسه مباشرة للجامعة. وتختلف هذه الرسوم من جامعة إلى أخرى وتتراوح عادةً بين 500 إلى 1000 يوان صيني (RMB).'
                : 'Service fees do not include official university registration/application assessment fees, which are paid directly to the university by the applicant. These range between 500 to 1,000 Chinese Yuan (RMB) depending on the university.'}
            </p>
          </div>

          <div className="rounded-2xl bg-white/80 p-4 border border-amber-200 text-center shrink-0 w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">
              {isAr ? 'سياسة دفع واضحة' : 'Payment Milestone'}
            </span>
            <span className="text-sm font-black text-brand-800 block mt-1">
              {isAr ? 'دفعة أولى عند البدء • والمتبقي بعد القبول' : 'Initial Deposit • Remainder After Admission'}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
