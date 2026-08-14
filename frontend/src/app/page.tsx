"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api, buildQuery } from "@/lib/api";
import { ListingCard as ListingCardT, SearchResult } from "@/lib/types";
import ListingCard from "@/components/ListingCard";
import ListingCardSkeleton from "@/components/ListingCardSkeleton";
import CategoryRow from "@/components/CategoryRow";
import FilterModal, { Filters } from "@/components/FilterModal";
import { MapPinOff } from "lucide-react";

const PAGE_SIZE = 12;

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageInner />
    </Suspense>
  );
}

function HomePageSkeleton() {
  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-8 py-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function HomePageInner() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ amenity_ids: [] });
  const [items, setItems] = useState<ListingCardT[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const location = searchParams.get("location") || undefined;
  const checkIn = searchParams.get("check_in") || undefined;
  const checkOut = searchParams.get("check_out") || undefined;
  const guests = searchParams.get("guests") || undefined;

  const fetchListings = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const qs = buildQuery({
          location,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          property_type: category || undefined,
          min_price: filters.min_price,
          max_price: filters.max_price,
          room_type: filters.room_type,
          amenity_ids: filters.amenity_ids.length ? filters.amenity_ids.join(",") : undefined,
          page: pageToLoad,
          page_size: PAGE_SIZE,
        });
        const result = await api.get<SearchResult>(`/api/listings${qs}`);
        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
        setTotal(result.total);
        setHasMore(result.has_more);
        setPage(pageToLoad);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [location, checkIn, checkOut, guests, category, filters]
  );

  useEffect(() => {
    fetchListings(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, checkIn, checkOut, guests, category, filters]);

  const activeSearchLabel = location
    ? `${total} stay${total === 1 ? "" : "s"} in ${location}`
    : `${total} stay${total === 1 ? "" : "s"} to explore`;

  return (
    <div>
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <CategoryRow active={category} onChange={setCategory} />
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl">{activeSearchLabel}</h1>
            {(checkIn || guests) && (
              <p className="text-hint text-sm mt-0.5">
                {checkIn && checkOut ? `${checkIn} → ${checkOut}` : ""}
                {guests ? ` · ${guests} guests` : ""}
              </p>
            )}
          </div>
          <FilterModal filters={filters} onApply={setFilters} />
        </div>
      </div>

      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MapPinOff size={40} className="text-hint mb-4" />
            <h2 className="font-semibold text-lg">No stays match your search</h2>
            <p className="text-hint text-sm mt-1">Try adjusting your dates, filters, or destination.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {items.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => fetchListings(page + 1, true)}
                  disabled={loadingMore}
                  className="border border-ink rounded-xl px-6 py-3 font-semibold text-sm hover:bg-neutral-100 disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Show more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
