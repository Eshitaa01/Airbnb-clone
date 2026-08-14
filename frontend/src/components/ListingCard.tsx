"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCard as ListingCardT } from "@/lib/types";
import { api } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

export default function ListingCard({ listing }: { listing: ListingCardT }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [wishlisted, setWishlisted] = useState(!!listing.is_wishlisted);
  const [busy, setBusy] = useState(false);
  const { user } = useUser();
  const { show } = useToast();

  const photos = listing.photos.length ? listing.photos : [{ id: 0, url: "", sort_order: 0 }];

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || busy) return;
    setBusy(true);
    const next = !wishlisted;
    setWishlisted(next);
    try {
      await api.post("/api/wishlist/toggle", { listing_id: listing.id });
      show(next ? "Added to wishlist" : "Removed from wishlist", "success");
    } catch {
      setWishlisted(!next);
      show("Something went wrong", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative aspect-square rounded-xl2 overflow-hidden bg-neutral-100">
        <img
          src={photos[photoIdx].url}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
              }}
              className="hidden group-hover:flex absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 items-center justify-center shadow-pop"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPhotoIdx((i) => (i + 1) % photos.length);
              }}
              className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 items-center justify-center shadow-pop"
            >
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
        {user && (
          <button
            onClick={toggleWishlist}
            aria-label="Toggle wishlist"
            className="absolute top-3 right-3 hover:scale-110 transition-transform"
          >
            <Heart
              size={22}
              className={wishlisted ? "fill-rausch text-rausch" : "fill-black/30 text-white"}
              strokeWidth={1.5}
            />
          </button>
        )}
      </div>
      <div className="mt-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm truncate">
            {listing.city}, {listing.country}
          </p>
          {listing.avg_rating && (
            <span className="flex items-center gap-1 text-sm shrink-0">
              <Star size={12} className="fill-ink" />
              {listing.avg_rating}
            </span>
          )}
        </div>
        <p className="text-hint text-sm truncate">{listing.title}</p>
        <p className="text-hint text-sm">{listing.room_type}</p>
        <p className="mt-1 text-sm">
          <span className="font-semibold">${listing.price_per_night.toFixed(0)}</span> night
        </p>
      </div>
    </Link>
  );
}
