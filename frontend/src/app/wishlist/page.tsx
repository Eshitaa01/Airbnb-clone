"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ListingCard as ListingCardT } from "@/lib/types";
import { api } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import ListingCardSkeleton from "@/components/ListingCardSkeleton";
import { useUser } from "@/context/UserContext";

export default function WishlistPage() {
  const { user, loading: userLoading } = useUser();
  const [items, setItems] = useState<ListingCardT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) return;
    setLoading(true);
    api
      .get<ListingCardT[]>("/api/wishlist")
      .then(setItems)
      .finally(() => setLoading(false));
  }, [user, userLoading]);

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-8 py-10">
      <h1 className="font-display font-extrabold text-3xl mb-8">Wishlist</h1>
      {loading || userLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center text-center py-24 border border-line rounded-2xl">
          <Heart size={36} className="text-hint mb-4" />
          <h2 className="font-semibold text-lg">No wishlists yet</h2>
          <p className="text-hint text-sm mt-1 mb-5">Tap the heart on any home to start your first wishlist.</p>
          <Link href="/" className="border border-ink rounded-xl px-5 py-2.5 font-semibold text-sm">
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
