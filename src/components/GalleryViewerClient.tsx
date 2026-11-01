'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { SupportedLocale } from '@/lib/i18n';
import { getLocalizedText } from '@/lib/visibility';

interface GalleryViewerProps {
  galleries: Array<{
    id: string;
    category: string;
    titleEn: string;
    titleAr?: string | null;
    descriptionEn?: string | null;
    descriptionAr?: string | null;
    images: Array<{
      id: string;
      imageUrl: string;
      captionEn?: string | null;
      captionAr?: string | null;
      descriptionEn?: string | null;
      descriptionAr?: string | null;
      sourceInfo?: string | null;
      verificationStatus?: string | null;
    }>;
  }>;
  lang: SupportedLocale;
  sectionTitle: string;
}

export function GalleryViewerClient({ galleries, lang, sectionTitle }: GalleryViewerProps) {
  const [lightbox, setLightbox] = useState<{
    images: GalleryViewerProps['galleries'][0]['images'];
    index: number;
  } | null>(null);

  // Rule 6 & 7: Never render anything if there are no visible galleries with published images
  const nonEmptyGalleries = (galleries ?? []).filter(
    (g) => Array.isArray(g.images) && g.images.length > 0
  );
  if (nonEmptyGalleries.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6">{sectionTitle}</h2>

      <div className="space-y-8">
        {nonEmptyGalleries.map((gallery) => {
          const gTitle = getLocalizedText(lang, gallery.titleAr, gallery.titleEn);
          const gDesc = getLocalizedText(lang, gallery.descriptionAr, gallery.descriptionEn);

          return (
            <div key={gallery.id} className="space-y-3">
              {gTitle && <h3 className="text-base font-semibold text-slate-800">{gTitle}</h3>}
              {gDesc && <p className="text-sm text-slate-600">{gDesc}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.images.map((img, idx) => {
                  const caption = getLocalizedText(lang, img.captionAr, img.captionEn);
                  return (
                    <div
                      key={img.id}
                      onClick={() => setLightbox({ images: gallery.images, index: idx })}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                    >
                      <div className="aspect-video overflow-hidden bg-slate-200">
                        <img
                          src={img.imageUrl}
                          alt={caption || gTitle || 'University photograph'}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      {(caption || img.sourceInfo) && (
                        <div className="p-3 bg-white">
                          {caption && <p className="text-xs font-medium text-slate-800">{caption}</p>}
                          {img.sourceInfo && (
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              <span>{img.sourceInfo}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 end-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close viewer"
          >
            <X className="h-6 w-6" />
          </button>

          {lightbox.images.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setLightbox({
                  ...lightbox,
                  index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length,
                })
              }
              className="absolute start-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="max-w-4xl w-full text-center space-y-3">
            <img
              src={lightbox.images[lightbox.index].imageUrl}
              alt="Full preview"
              className="max-h-[75vh] mx-auto rounded-lg object-contain"
            />
            {getLocalizedText(
              lang,
              lightbox.images[lightbox.index].captionAr,
              lightbox.images[lightbox.index].captionEn
            ) && (
              <p className="text-sm text-white font-medium">
                {getLocalizedText(
                  lang,
                  lightbox.images[lightbox.index].captionAr,
                  lightbox.images[lightbox.index].captionEn
                )}
              </p>
            )}
          </div>

          {lightbox.images.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setLightbox({
                  ...lightbox,
                  index: (lightbox.index + 1) % lightbox.images.length,
                })
              }
              className="absolute end-16 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
