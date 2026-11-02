'use client';

import React, { useState } from 'react';
import { Award, CheckCircle2, ChevronDown, ChevronUp, Sparkles, X, ZoomIn } from 'lucide-react';
import { SupportedLocale } from '@/lib/i18n';

interface OfficialTestimonialsGalleryProps {
  lang: SupportedLocale;
}

export function OfficialTestimonialsGallery({ lang }: OfficialTestimonialsGalleryProps) {
  const isAr = lang === 'ar';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const allTestimonials = [
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
    {
      img: '/assets/testimonials/09.jpg',
      quoteAr: 'استلمت إشعار القبول الرسمي ونموذج التأشيرة في وقت قياسي. فريق محترف جداً في التعامل.',
      quoteEn: 'Received official acceptance and visa form in record time. Outstandingly professional team.',
      studentAr: 'محمد ف. • هندسة اتصالات',
      studentEn: 'Mohamed F. • Telecommunications',
      city: 'Shenzhen',
    },
    {
      img: '/assets/testimonials/10.jpg',
      quoteAr: 'بفضل الله ثم توجيهاتكم تم قبولي مع منحة سكن دراسي كامل. أنصح أي طالب بالتواصل معهم.',
      quoteEn: 'By God grace and your guidance, accepted with full accommodation grant. Highly recommended!',
      studentAr: 'حسام د. • ماجستير هندسة كيميائية',
      studentEn: 'Hossam D. • Chemical Engineering',
      city: 'Tianjin',
    },
    {
      img: '/assets/testimonials/11.jpg',
      quoteAr: 'وصل القبول الجامعي بسلام! تجهيز الأوراق والتقديم كان في غاية الدقة والسرعة.',
      quoteEn: 'Admission notice safely received! Document preparation was thorough, precise, and fast.',
      studentAr: 'ريم ع. • صيدلة وسريريات',
      studentEn: 'Reem A. • Pharmacy',
      city: 'Dalian',
    },
    {
      img: '/assets/testimonials/12.jpg',
      quoteAr: 'خدمة راقية واستقبال ممتاز في المطار عند وصولي للصين. شكراً من القلب.',
      quoteEn: 'Superb service and warm airport welcome upon landing in China. Heartfelt gratitude.',
      studentAr: 'بلال ت. • علوم مالية ومصرفية',
      studentEn: 'Belal T. • Finance & Banking',
      city: 'Suzhou',
    },
    {
      img: '/assets/testimonials/13.jpg',
      quoteAr: 'الحمد لله قبول هندسة الميكانيكا وصل! متابعة ولا أروع حتى استلام بطاقة الطالب.',
      quoteEn: 'Mechanical Engineering acceptance received! Fantastic follow-up until student card issuance.',
      studentAr: 'عاصم ن. • هندسة ميكانيكية',
      studentEn: 'Asim N. • Mechanical Engineering',
      city: 'Chongqing',
    },
    {
      img: '/assets/testimonials/14.jpg',
      quoteAr: 'شكراً لمكتب التنين الأحمر على توفير مقعد دراسي متميز في جامعة مرموقة.',
      quoteEn: 'Thank you Red Dragon Study for securing a prime academic seat at a renowned university.',
      studentAr: 'ماجد ك. • بكالوريوس تمريض',
      studentEn: 'Majed K. • Nursing',
      city: 'Harbin',
    },
    {
      img: '/assets/testimonials/15.jpg',
      quoteAr: 'تم الحصول على القبول ومنحة دراسية تغطي الرسوم. مجهود جبار يستحق كل الشكر والتقدير.',
      quoteEn: 'Secured admission and tuition-waiver grant. Outstanding effort deserving full appreciation.',
      studentAr: 'فاطمة ل. • لغات وترجمة',
      studentEn: 'Fatima L. • Translation & Languages',
      city: 'Xi’an',
    },
    {
      img: '/assets/testimonials/16.jpg',
      quoteAr: 'إجراءات السفارة واستخراج التأشيرة تمت بكل سهولة بمساعدتكم وتوجيهاتكم المستمرة.',
      quoteEn: 'Embassy processing and visa issuance went seamlessly with your continuous guidance.',
      studentAr: 'زياد م. • نظم معلومات إدارية',
      studentEn: 'Ziad M. • MIS',
      city: 'Jinan',
    },
    {
      img: '/assets/testimonials/17.jpg',
      quoteAr: 'الحمد لله رب العالمين، خطوة جديدة ومستقبل واعد بالدراسة في الصين مع أفضل فريق.',
      quoteEn: 'Praise be to God, a promising academic journey in China alongside the best support team.',
      studentAr: 'مصطفى ق. • هندسة الطيران',
      studentEn: 'Mustafa Q. • Aerospace Engineering',
      city: 'Nanchang',
    },
    {
      img: '/assets/testimonials/18.jpg',
      quoteAr: 'تسليم القبول ونموذج JW202 تم في الموعد المحدد تماماً بدون أي تأخير.',
      quoteEn: 'Admission notice and JW202 were delivered on the exact scheduled timeline without delays.',
      studentAr: 'أنس ج. • إدارة لوجستيات وسلاسل إمداد',
      studentEn: 'Anas J. • Logistics & Supply Chain',
      city: 'Ningbo',
    },
    {
      img: '/assets/testimonials/19.jpg',
      quoteAr: 'الصدق والأمانة والاحترافية عنوان تعاملهم. أنصح كل من يريد الدراسة في الصين بالتقديم معهم.',
      quoteEn: 'Honesty, integrity, and professionalism define their work. Highly recommended for study in China.',
      studentAr: 'عبد الله ب. • ماجستير ذكاء اصطناعي',
      studentEn: 'Abdullah B. • Master in AI',
      city: 'Changsha',
    },
    {
      img: '/assets/testimonials/20.jpg',
      quoteAr: 'قبولي في بكالوريوس الطب باللغة الإنجليزية في الصين تحقق بفضل الله ثم مساندتكم.',
      quoteEn: 'My undergraduate English-taught MBBS admission in China came true with your full backing.',
      studentAr: 'هند ر. • بكالوريوس طب بشري MBBS',
      studentEn: 'Hind R. • MBBS Clinical Medicine',
      city: 'Xiamen',
    },
    {
      img: '/assets/testimonials/21.jpg',
      quoteAr: 'كل الشكر لفريق Red Dragon Study على استقبال المطار وتأمين السكن الجامعي المريح.',
      quoteEn: 'Deep thanks to Red Dragon Study for airport welcome and securing comfortable campus dorms.',
      studentAr: 'سليمان ع. • هندسة بيئية',
      studentEn: 'Sulaiman A. • Environmental Engineering',
      city: 'Fuzhou',
    },
    {
      img: '/assets/testimonials/22.jpg',
      quoteAr: 'تجربة ناجحة وسلسة من أول يوم استشارة وحتى بدأت دراستي الجامعية في الصين.',
      quoteEn: 'A smooth and successful journey from the very first consultation till classes began in China.',
      studentAr: 'نور س. • إدارة أعمال دولية',
      studentEn: 'Noor S. • International Business',
      city: 'Hefei',
    },
    {
      img: '/assets/testimonials/23.jpg',
      quoteAr: 'الحمد لله، استلمت التأشيرة والقبول الجامعي وجاهز للسفر. شكراً Red Dragon Study.',
      quoteEn: 'Alhamdulillah, visa and admission notice received and ready for flight. Thanks team!',
      studentAr: 'وائل م. • علوم بيولوجية',
      studentEn: 'Wael M. • Biological Sciences',
      city: 'Wenzhou',
    },
    {
      img: '/assets/testimonials/24.jpg',
      quoteAr: 'تعامل راقي وشفاف في كل خطوة، ومتابعة دقيقة لكل تفاصيل القبول والمنح.',
      quoteEn: 'Transparent and respectful handling at every step, with detail-oriented tracking.',
      studentAr: 'حمزة ف. • هندسة إلكترونيات',
      studentEn: 'Hamza F. • Electronics Engineering',
      city: 'Guiyang',
    },
    {
      img: '/assets/testimonials/25.jpg',
      quoteAr: 'فرحتي بالقبول لا توصف! شكراً لكل القائمين على هذا المكتب الرائع.',
      quoteEn: 'Indescribable joy upon receiving my acceptance! Huge thanks to everyone in this office.',
      studentAr: 'شهد ع. • تصميم رقمي وفنون',
      studentEn: 'Shahd A. • Digital Design',
      city: 'Zhengzhou',
    },
    {
      img: '/assets/testimonials/26.jpg',
      quoteAr: 'أنصح كل الطلاب بالتقديم عبر Red Dragon Study لضمان القبول الرسمي وخدمات ما بعد الوصول.',
      quoteEn: 'I recommend every aspiring student to apply via Red Dragon Study for official peace of mind.',
      studentAr: 'ياسين ح. • هندسة اتصالات وشبكات',
      studentEn: 'Yassin H. • Network Engineering',
      city: 'Changchun',
    },
  ];

  const displayed = showAll ? allTestimonials : allTestimonials.slice(0, 8);

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-4">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isAr ? 'قبولات حقيقية ورسمية' : 'Authentic Student Admissions'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'تجارب وقبولات طلابنا في الصين' : 'Real Admissions & Student Testimonials'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            {isAr
              ? 'نماذج حقيقية من إشعارات القبول وتأشيرات السفر الرسمية التي حققناها لطلابنا بمختلف الجامعات والمدن الصينية.'
              : 'Authentic admission notices and success stories achieved for our international students across China.'}
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {displayed.map((t, idx) => (
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
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold backdrop-blur">
                      <ZoomIn className="h-4 w-4" />
                      {isAr ? 'عرض الإشعار' : 'View Notice'}
                    </span>
                  </div>
                  <span className="absolute bottom-2 end-2 rounded-lg bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur">
                    {isAr ? 'قبول رسمي ✓' : 'Official Notice ✓'}
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

        {/* Toggle Show All / Less */}
        <div className="text-center mb-14">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-brand-300 transition"
          >
            {showAll ? (
              <>
                <span>{isAr ? 'عرض قبولات أقل ↑' : 'Show Less ↑'}</span>
                <ChevronUp className="h-4 w-4 text-brand-700" />
              </>
            ) : (
              <>
                <span>
                  {isAr
                    ? `عرض المزيد من إشعارات القبول (${allTestimonials.length} قبول جامعي) ↓`
                    : `View More Admissions (${allTestimonials.length} Notices) ↓`}
                </span>
                <ChevronDown className="h-4 w-4 text-brand-700" />
              </>
            )}
          </button>
        </div>

        {/* CTA to Apply */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-950 via-brand-900 to-slate-900 p-8 sm:p-12 text-white text-center shadow-xl">
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
