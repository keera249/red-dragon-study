import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { generateUniversityCode } from '@/lib/university-code';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const [publishedUniversities, publishedScholarships, publishedPages] = await Promise.all([
    prisma.university.findMany({
      where: { status: 'PUBLISHED', noIndex: false },
      select: { slug: true, nameEn: true, updatedAt: true },
    }),
    prisma.scholarship.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.websitePage.findMany({
      where: { status: 'PUBLISHED', isEnabled: true, noIndex: false },
      select: { slug: true, isSystemPage: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    {
      url: `${baseUrl}/universities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/scholarships`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const uniRoutes: MetadataRoute.Sitemap = publishedUniversities.map((u) => ({
    url: `${baseUrl}/universities/${generateUniversityCode(u)}`,
    lastModified: u.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const schRoutes: MetadataRoute.Sitemap = publishedScholarships.map((s) => ({
    url: `${baseUrl}/scholarships/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const pageRoutes: MetadataRoute.Sitemap = publishedPages.map((p) => ({
    url: p.isSystemPage ? `${baseUrl}/${p.slug}` : `${baseUrl}/p/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...uniRoutes, ...schRoutes, ...pageRoutes];
}
