'use client';

import React from 'react';
import {
  GraduationCap,
  FileCheck,
  Plane,
  Building,
  Home,
  Smartphone,
  Shield,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import { SupportedLocale } from '@/lib/i18n';

interface OfficialServicesSectionProps {
  lang: SupportedLocale;
}

export function OfficialServicesSection({ lang }: OfficialServicesSectionProps) {
  const isAr = lang === 'ar';

  const services = [
    {
      icon: GraduationCap,
      step: '01',
      titleAr: 'استخراج القبول الجامعي',
      titleEn: 'University Admission Issuance',
      descAr: 'متابعة ملفك مباشرة مع عمادة القبول في الجامعات الصينية حتى استلام القبول المبدئي والرسمي.',
      descEn: 'Direct liaison with Chinese university admissions offices until formal and official admission is secured.',
    },
    {
      icon: FileCheck,
      step: '02',
      titleAr: 'إجراءات السفارة الصينية',
      titleEn: 'Embassy & Visa Procedures',
      descAr: 'تجهيز ملف التأشيرة الدراسية (X1 / X2) وحجز المواعيد ومتابعة متطلبات الفحص والأوراق الرسمية.',
      descEn: 'Preparation of student visa documentation (X1/X2), appointment booking, and statutory compliance checks.',
    },
    {
      icon: Plane,
      step: '03',
      titleAr: 'الاستقبال في المطار',
      titleEn: 'Airport Welcome & Transfer',
      descAr: 'فريقنا يستقبلك فور وصولك إلى المطار في الصين لضمان انتقال آمن ومريح إلى المدينة والجامعة.',
      descEn: 'Our on-ground team receives you upon landing in China for safe, seamless transit directly to your campus.',
    },
    {
      icon: Building,
      step: '04',
      titleAr: 'التسجيل في الجامعة',
      titleEn: 'On-Campus University Registration',
      descAr: 'مرافقتك في مكاتب شؤون الطلاب الدوليين لإنهاء إجراءات التسجيل ودفع الرسوم واستلام البطاقة الجامعية.',
      descEn: 'In-person assistance at the international student registry, fee settlements, and student ID issuance.',
    },
    {
      icon: Home,
      step: '05',
      titleAr: 'إجراءات السكن الجامعي',
      titleEn: 'Dormitory & Accommodation Setup',
      descAr: 'تأكيد حجز السكن الجامعي واستلام الغرفة وتجهيز كافة المستلزمات الأساسية للإقامة المريحة.',
      descEn: 'Finalizing campus dorm allocation, room check-in, and securing essential living utilities.',
    },
    {
      icon: Smartphone,
      step: '06',
      titleAr: 'شريحة الاتصالات والإنترنت',
      titleEn: 'Local SIM & Digital Setup',
      descAr: 'المساعدة في استخراج الشريحة الصينية وتفعيل الإنترنت وحسابات البنوك وتطبيقات الدفع الأساسية (WeChat / Alipay).',
      descEn: 'Issuance of Chinese SIM card, data packages, local banking accounts, and essential daily payment apps.',
    },
    {
      icon: Shield,
      step: '07',
      titleAr: 'إجراءات الإقامة الرسمية',
      titleEn: 'Residence Permit & Immigration',
      descAr: 'استكمال الفحص الطبي داخل الصين ومرافقتك إلى إدارة الهجرة والجوازات لاستخراج تصريح الإقامة السنوي.',
      descEn: 'Local health check completion and escorting to Public Security Entry-Exit bureau for the Residence Permit.',
    },
    {
      icon: HeartHandshake,
      step: '08',
      titleAr: 'متابعة مستمرة وإشراف أكاديمي',
      titleEn: 'Continuous Academic Mentorship',
      descAr: 'نبقى على تواصل دائم معك طوال مسيرتك الدراسية لتقديم الدعم وحل أي عقبات أكاديمية أو معيشية.',
      descEn: 'Dedicated advisory throughout your study duration in China to assist with academic or daily life matters.',
    },
  ];

  const stats = [
    { number: '560+', labelAr: 'قبول جامعي محقق', labelEn: 'Admissions Secured' },
    { number: '300+', labelAr: 'جامعة صينية معتمدة', labelEn: 'Partner Universities' },
    { number: '46', labelAr: 'مدينة صينية مغطاة', labelEn: 'Chinese Cities' },
    { number: '100%', labelAr: 'نسبة رضا الطلاب', labelEn: 'Satisfaction Rate' },
  ];

  return (
    <section id="services" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-amber-600/20 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Real Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-20 text-center">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight">
                {s.number}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-300">
                {isAr ? s.labelAr : s.labelEn}
              </div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isAr ? 'خدماتنا المتكاملة من الألف إلى الياء' : 'Comprehensive End-to-End Services'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {isAr ? 'رحلتك إلى الصين... خطوة بخطوة' : 'Your Journey to China... Step by Step'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            {isAr
              ? 'لا نكتفي بإحضار القبول فقط؛ نحن معك من أول تجهيز الأوراق حتى استقرارك في مقعدك الجامعي في الصين.'
              : 'Beyond securing university admission, we guide and support you across every practical and legal transition in China.'}
          </p>
        </div>

        {/* 8 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700/80 text-amber-300 group-hover:scale-110 transition">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-black text-slate-400">{srv.step}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {isAr ? srv.titleAr : srv.titleEn}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? srv.descAr : srv.descEn}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-amber-300">
                  <span>{isAr ? 'خدمة مشمولة ومؤكدة' : 'Included Service'}</span>
                  <span className="opacity-60">✓</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
