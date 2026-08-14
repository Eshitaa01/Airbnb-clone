"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ShieldCheck, Award, MapPin } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { ListingDetail } from "@/lib/types";
import Gallery from "@/components/Gallery";
import BookingWidget from "@/components/BookingWidget";
import ReviewsSection from "@/components/ReviewsSection";
import { getAmenityIcon } from "@/lib/amenityIcons";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get<ListingDetail>(`/api/listings/${params.id}`)
      .then((data) => {
        if (active) setListing(data);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-10 animate-pulse">
        <div className="h-8 w-1/2 bg-neutral-200 rounded mb-4" />
        <div className="h-[420px] bg-neutral-200 rounded-2xl" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-24 text-center">
        <h1 className="font-semibold text-2xl mb-2">Listing not found</h1>
        <p className="text-hint mb-6">This listing may have been removed by its host.</p>
        <button onClick={() => router.push("/")} className="border border-ink rounded-xl px-5 py-2.5 font-semibold">
          Back to explore
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-6">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl">{listing.title}</h1>
      <div className="flex items-center gap-3 mt-2 text-sm">
        {listing.avg_rating && (
          <span className="flex items-center gap-1 font-medium">
            <Star size={13} className="fill-ink" />
            {listing.avg_rating} · {listing.review_count} review{listing.review_count === 1 ? "" : "s"}
          </span>
        )}
        <span className="flex items-center gap-1 text-hint underline">
          <MapPin size={13} />
          {listing.city}, {listing.country}
        </span>
      </div>

      <div className="mt-5">
        <Gallery photos={listing.photos} title={listing.title} />
      </div>

      <div className="grid lg:grid-cols-3 gap-10 mt-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between pb-6 border-b border-line">
            <div>
              <h2 className="font-semibold text-lg">
                {listing.room_type} hosted by {listing.host.name}
              </h2>
              <p className="text-hint text-sm mt-1">
                {listing.max_guests} guests · {listing.bedrooms} bedroom{listing.bedrooms > 1 ? "s" : ""} ·{" "}
                {listing.beds} bed{listing.beds > 1 ? "s" : ""} · {listing.bathrooms} bath
                {listing.bathrooms > 1 ? "s" : ""}
              </p>
            </div>
            <img
              src={listing.host.avatar_url}
              alt={listing.host.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          </div>

          <div className="py-6 border-b border-line space-y-4">
            {listing.host.is_superhost && (
              <div className="flex gap-3">
                <Award size={22} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{listing.host.name} is a Superhost</p>
                  <p className="text-hint text-sm">Superhosts are experienced, highly rated hosts.</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <ShieldCheck size={22} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Great location</p>
                <p className="text-hint text-sm">Guests love the neighborhood surrounding this home.</p>
              </div>
            </div>
          </div>

          <div className="py-6 border-b border-line">
            <p className="text-charcoal leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          <div className="py-6 border-b border-line">
            <h2 className="font-semibold text-xl mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 gap-y-3">
              {listing.amenities.map((a) => {
                const Icon = getAmenityIcon(a.icon);
                return (
                  <div key={a.id} className="flex items-center gap-3 text-sm">
                    <Icon size={20} strokeWidth={1.5} />
                    {a.name}
                  </div>
                );
              })}
            </div>
          </div>

          <ReviewsSection reviews={listing.reviews} avgRating={listing.avg_rating} />

          <div className="py-6">
            <h2 className="font-semibold text-xl mb-3">Where you&apos;ll be</h2>
            <div className="rounded-2xl overflow-hidden border border-line h-64 bg-neutral-100 flex items-center justify-center relative">
              <img
                src={`https://picsum.photos/seed/map-${listing.id}/900/400`}
                alt="Map preview"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-3 shadow-pop">
                  <MapPin size={20} className="text-rausch" />
                </div>
              </div>
            </div>
            <p className="text-hint text-sm mt-2">
              {listing.city}, {listing.country} — exact location shared after booking.
            </p>
          </div>
        </div>

        <div>
          <BookingWidget listing={listing} />
        </div>
      </div>
    </div>
  );
}
