"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Star, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { ListingDetail, Booking } from "@/lib/types";
import { useUser } from "@/context/UserContext";

export default function HostDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const [tab, setTab] = useState<"listings" | "bookings">("listings");
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user?.is_host) return;
    setLoading(true);
    Promise.all([
      api.get<ListingDetail[]>("/api/host/listings"),
      api.get<Booking[]>("/api/host/bookings"),
    ])
      .then(([l, b]) => {
        setListings(l);
        setBookings(b);
      })
      .finally(() => setLoading(false));
  }, [user, userLoading]);

  if (userLoading || loading) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 text-hint">Loading your dashboard…</div>;
  }

  if (!user?.is_host) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-8 py-24 text-center">
        <h1 className="font-semibold text-2xl mb-2">You&apos;re not hosting yet</h1>
        <p className="text-hint mb-6">Use the menu in the top right to become a host.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-extrabold text-3xl">Host dashboard</h1>
        <Link
          href="/host/listings/new"
          className="flex items-center gap-2 bg-rausch hover:bg-rausch-dark text-white rounded-xl px-4 py-2.5 font-semibold text-sm"
        >
          <Plus size={16} /> New listing
        </Link>
      </div>

      <div className="flex gap-6 border-b border-line mb-6">
        <TabButton active={tab === "listings"} onClick={() => setTab("listings")} label={`Listings (${listings.length})`} />
        <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")} label={`Bookings (${bookings.length})`} />
      </div>

      {tab === "listings" &&
        (listings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <div key={l.id} className="border border-line rounded-2xl overflow-hidden group">
                <div className="relative aspect-[4/3]">
                  <img src={l.photos[0]?.url} alt={l.title} className="w-full h-full object-cover" />
                  <Link
                    href={`/host/listings/${l.id}/edit`}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-pop opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={14} />
                  </Link>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm truncate">{l.title}</p>
                  <p className="text-hint text-sm">
                    {l.city}, {l.country}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold">${l.price_per_night.toFixed(0)}/night</span>
                    {l.avg_rating && (
                      <span className="flex items-center gap-1 text-xs text-hint">
                        <Star size={11} className="fill-ink text-ink" /> {l.avg_rating}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/host/listings/${l.id}/edit`}
                    className="mt-3 block text-center border border-ink rounded-xl py-2 text-sm font-semibold hover:bg-neutral-100"
                  >
                    Manage listing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ))}

      {tab === "bookings" &&
        (bookings.length === 0 ? (
          <p className="text-hint py-12 text-center">No bookings yet for your listings.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 border border-line rounded-2xl p-4">
                <img src={b.listing.photos[0]?.url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{b.listing.title}</p>
                  <p className="text-hint text-sm">
                    {format(new Date(b.check_in + "T00:00:00"), "MMM d")} –{" "}
                    {format(new Date(b.check_out + "T00:00:00"), "MMM d, yyyy")} · {b.guests} guest
                    {b.guests > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">${b.total_price.toFixed(0)}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      b.status === "confirmed"
                        ? "bg-green-50 text-green-700"
                        : b.status === "cancelled"
                        ? "bg-neutral-100 text-hint"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-semibold border-b-2 -mb-px ${
        active ? "border-ink text-ink" : "border-transparent text-hint hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-20 border border-line rounded-2xl">
      <h2 className="font-semibold text-lg">You haven&apos;t listed a place yet</h2>
      <p className="text-hint text-sm mt-1 mb-5">Create your first listing to start hosting guests.</p>
      <Link href="/host/listings/new" className="bg-rausch text-white rounded-xl px-5 py-2.5 font-semibold text-sm">
        Create a listing
      </Link>
    </div>
  );
}
