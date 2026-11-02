'use client';

import React, { useState } from 'react';
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, X, ZoomIn } from 'lucide-react';
import { SupportedLocale } from '@/lib/i18n';

interface OfficialTestimonialsGalleryProps {
  lang: SupportedLocale;
}

export function OfficialTestimonialsGallery({ lang }: OfficialTestimonialsGalleryProps) {
  const isAr = lang === 'ar';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const testimonials = [
    {
      img: '/assets/testimonials/01.jpg',
      quoteAr: 'الحمد لله تم قبولي في جامعة تشينغداو! شكراً جزيلاً لفريق Red Dragon Study على الاحترافية والمتابعة خطوة بخطوة.',
      quoteEn: 'Praise be to God, accepted at Qingdao University! Huge thanks to Red Dragon Study for their professional guidance.',
      studentAr: 'عمر م. • بكالوريوس هندسة برمجيات',
      studentEn: 'Omar M. • Software Engineering',
      city: 'Qingdao',
    },
    {
      img: '/assets/testimonials/02.jpg',
      quoteAr: 'اليوم استلمت القبول الجامعي ونموذج JW202 والحمد لله. شكراً ليكم على وقفتكم ومتابعتكم المستمرة حتى الفيزا.',
      quoteEn: 'Received my admission notice and JW202 form today. Thank you for staying with me throughout the visa process.',
      studentAr: 'أحمد ع. • ماجستير إدارة أعمال',
      studentEn: 'Ahmad A. • MBA Master',
      city: 'Beijing',
    },
    {
      img: '/assets/testimonials/03.jpg',
      quoteAr: 'مبسوط جداً بقبولي في الجامعة وبمنحة دراسية ممتازة. شكراً لكل فريق Red Dragon Study على تعبكم معاي.',
      quoteEn: 'Extremely thrilled with my university admission and great scholarship. Thank you team for everything!',
      studentAr: 'يوسف خ. • بكالوريوس طب وجراحة',
      studentEn: 'Yousef K. • MBBS Medicine',
      city: 'Wuhan',
    },
    {
      img: '/assets/testimonials/04.jpg',
      quoteAr: 'القبول وصل 🎓🇨🇳 الحمد لله، وكل الشكر للفريق على المجهود والمتابعة من البداية وحتى الاستقبال في المطار.',
      quoteEn: 'Admission arrived! 🎓🇨🇳 All thanks to the team for their dedicated follow up from day one to airport pickup.',
      studentAr: 'سارة ن. • سنة لغة تحضيرية',
      studentEn: 'Sarah N. • Preparatory Chinese',
      city: 'Shanghai',
    },
    {
      img: '/assets/testimonials/05.jpg',
      quoteAr: 'تعبكم ما راح هدر، الحمد لله استلمت القبول الجامعي الموثق. تعامل راقي ومصداقية عالية.',
      quoteEn: 'Efforts rewarded! Officially received my admission certificate. Transparent and trustworthy team.',
      studentAr: 'طارق م. • هندسة مدنية',
      studentEn: 'Tariq M. • Civil Engineering',
      city: 'Nanjing',
    },
    {
      img: '/assets/testimonials/06.jpg',
      quoteAr: 'شكراً Red Dragon Study، ساعدتوني أوصل للهدف اللي كنت بتمناه في الصين. الحمد لله على القبول.',
      quoteEn: 'Thank you Red Dragon Study, you helped me achieve the study goal I always dreamed of in China.',
      studentAr: 'خالد س. • علوم حاسوب وذكاء اصطناعي',
      studentEn: 'Khaled S. • CS & AI',
      city: 'Hangzhou',
    },
    {
      img: '/assets/testimonials/07.jpg',
      quoteAr: 'شكراً جداً على كل المساعدة، والحمد لله اليوم عندي قبول جامعي في الصين وإشراف كامل.',
      quoteEn: 'Thank you for all the help, today I hold my university acceptance in China with continuous guidance.',
      studentAr: 'مروان ع. • تجارة دولية',
      studentEn: 'Marwan A. • International Trade',
      city: 'Guangzhou',
    },
    {
      img: '/assets/testimonials/08.jpg',
      quoteAr: 'الحمد لله اتقبلت في الجامعة ❤️ شكراً Red Dragon Study على المتابعة والمساعدة في كل خطوة.',
      quoteEn: 'Accepted at the university ❤️ Thank you Red Dragon Study for standing by me every step.',
      studentAr: 'إبراهيم ح. • لغة واقتصاد',
      studentEn: 'Ibrahim H. • Chinese & Economics',
      city: 'Chengdu',
    },
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-4">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isAr ? 'قبولات حقيقية وموثقة' : 'Verified Student Admissions'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'تجارب وقبولات طلابنا في الصين' : 'Real Admissions & Student Testimonials'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            {isAr
              ? 'نماذج حقيقية من إشعارات القبول وتأشيرات السفر التي حققناها لطلابنا بمختلف الجامعات والمدن الصينية.'
              : 'Authentic admission notices and success stories achieved for our international students across China.'}
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Zoom */}
                <div
                  onClick={() => setSelectedImage(t.img)}
                  className="relative h-56 w-full rounded-2xl overflow-hidden bg-slate-100 cursor-pointer mb-4 border border-slate-100"
                >
                  <img
                    src={t.img}
                    alt={t.studentAr}
                    className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold backdrop-blur">
                      <ZoomIn className="h-4 w-4" />
                      {isAr ? 'عرض الإشعار' : 'View Notice'}
                    </span>
                  </div>
                  <span className="absolute bottom-2 end-2 rounded-lg bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur">
                    {isAr ? 'قبول مؤكد ✓' : 'Verified Admission ✓'}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                  “{isAr ? t.quoteAr : t.quoteEn}”
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">
                    {isAr ? t.studentAr : t.studentEn}
                  </h4>
                  <span className="text-[10px] text-brand-700 font-semibold">{t.city}, China</span>
                </div>
                <Award className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Apply */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 p-8 sm:p-12 text-white text-center shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            {isAr ? 'كن أنت قصة النجاح القادمة في الصين!' : 'Be Our Next Success Story in China!'}
          </h3>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto mb-8">
            {isAr
              ? 'ابدأ بتحميل استمارة التقديم ونموذج الفحص الطبي، وتواصل مباشرة مع خبرائنا لاختيار الجامعة والمنحة المناسبة لك.'
              : 'Download the application and medical examination forms today, and connect with our advisors to secure your university seat in China.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#downloads"
              className="rounded-2xl bg-white px-6 py-3.5 text-xs sm:text-sm font-extrabold text-brand-900 shadow hover:bg-slate-100 transition"
            >
              {isAr ? 'تحميل الاستمارات الرسمية ↓' : 'Download Official Forms ↓'}
            </a>
            <a
              href="https://wa.me/8615518309290?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20Red%20Dragon%20Study%20%F0%9F%87%A8%F0%9F%87%B3%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A8%D8%AF%D8%A1%20%D8%A5%D8%AC%D8%B1%D8%A7%D8%A1%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AA%D9%82%D8%AF%D9%8A%D9%85%20%D9%84%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D8%A9%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%B5%D9%8A%D9%86."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-amber-400 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-brand-950 shadow hover:bg-amber-300 transition"
            >
              {isAr ? 'تواصل معنا عبر واتساب ←' : 'Chat on WhatsApp →'}
            </a>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[90vh] bg-white rounded-3xl p-4 shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 end-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black transition"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Acceptance Letter"
              className="max-h-[80vh] w-auto rounded-2xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </section>
  );
}
