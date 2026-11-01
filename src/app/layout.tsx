import type { Metadata } from 'next';
import './globals.css';
import { getCurrentLocale } from '@/lib/i18n-server';
import { getDirection } from '@/lib/i18n';
import { prisma } from '@/lib/prisma';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getCurrentLocale();
  const sys = await prisma.systemSetting.findUnique({ where: { id: 'default' } }).catch(() => null);

  const title =
    lang === 'ar'
      ? sys?.seoDefaultTitleAr || 'التنين الأحمر للدراسة | القبول الجامعي والمنح الدراسية في الصين'
      : sys?.seoDefaultTitleEn || 'Red Dragon Study | China University Admissions & Scholarships';

  const description =
    lang === 'ar'
      ? sys?.seoDefaultDescAr ||
        'اكتشف الجامعات الصينية المعتمدة والبرامج الأكاديمية والمنح الدراسية ومتطلبات القبول مع مؤسسة التنين الأحمر للدراسة.'
      : sys?.seoDefaultDescEn ||
        'Discover accredited Chinese universities, academic programs, scholarships, and admission requirements with Red Dragon Study.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/logo.jpeg'],
      type: 'website',
    },
    icons: {
      icon: '/logo.jpeg',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getCurrentLocale();
  const dir = getDirection(lang);

  return (
    <html lang={lang} dir={dir}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
