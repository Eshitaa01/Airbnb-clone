"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";
import { Photo } from "@/lib/types";

export default function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const imgs = photos.length ? photos : [{ id: 0, url: "", sort_order: 0 }];

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px]">
        <button onClick={() => setLightbox(0)} className="col-span-2 row-span-2 relative">
          <img src={imgs[0].url} alt={title} className="w-full h-full object-cover hover:brightness-90 transition" />
        </button>
        {imgs.slice(1, 5).map((p, i) => (
          <button key={p.id} onClick={() => setLightbox(i + 1)} className="relative">
            <img src={p.url} alt={title} className="w-full h-full object-cover hover:brightness-90 transition" />
          </button>
        ))}
      </div>
      {photos.length > 0 && (
        <button
          onClick={() => setLightbox(0)}
          className="mt-4 flex items-center gap-2 border border-ink rounded-xl px-4 py-2 text-sm font-semibold hover:bg-neutral-100"
        >
          <Grid3x3 size={14} /> Show all photos
        </button>
      )}

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-line">
            <button onClick={() => setLightbox(null)} className="p-2 hover:bg-neutral-100 rounded-full">
              <X size={20} />
            </button>
            <span className="text-sm font-medium">
              {lightbox + 1} / {imgs.length}
            </span>
            <span className="w-9" />
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4">
            <img src={imgs[lightbox].url} alt={title} className="max-h-[80vh] max-w-full object-contain rounded-lg" />
            {imgs.length > 1 && (
              <>
                <button
                  onClick={() => setLightbox((i) => (i! - 1 + imgs.length) % imgs.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-pop flex items-center justify-center"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setLightbox((i) => (i! + 1) % imgs.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-pop flex items-center justify-center"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
