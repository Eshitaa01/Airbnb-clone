"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Booking } from "@/lib/types";
import { api } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { Luggage } from "lucide-react";

export default function TripsPage() {
  const { user, loading: userLoading } = useUser();
  const { show } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (userLoading || !user) return;
    setLoading(true);
    api
      .get<Booking[]>("/api/bookings/mine")
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [user, userLoading]);

  async function cancelBooking(id: number) {
    setCancellingId(id);
    try {
      const updated = await api.post<Booking>(`/api/bookings/${id}/cancel`);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      show("Booking cancelled");
    } catch {
      show("Could not cancel booking", "error");
    } finally {
      setCancellingId(null);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.status === "confirmed" && b.check_out >= today);
  const past = bookings.filter((b) => b.status !== "confirmed" || b.check_out < today);

  if (loading || userLoading) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 text-hint">Loading your trips…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="font-display font-extrabold text-3xl mb-1">Trips</h1>
      <p className="text-hint mb-8">All bookings made as {user?.name}.</p>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center text-center py-24 border border-line rounded-2xl">
          <Luggage size={36} className="text-hint mb-4" />
          <h2 className="font-semibold text-lg">No trips booked…yet!</h2>
          <p className="text-hint text-sm mt-1 mb-5">Time to dust off your bags and start planning your next adventure.</p>
          <Link href="/" className="border border-ink rounded-xl px-5 py-2.5 font-semibold text-sm">
            Start searching
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-semibold text-xl mb-4">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map((b) => (
                  <TripCard key={b.id} booking={b} onCancel={cancelBooking} cancelling={cancellingId === b.id} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="font-semibold text-xl mb-4">Past & cancelled</h2>
              <div className="space-y-4">
                {past.map((b) => (
                  <TripCard key={b.id} booking={b} onCancel={cancelBooking} cancelling={cancellingId === b.id} readOnly />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function TripCard({
  booking,
  onCancel,
  cancelling,
  readOnly,
}: {
  booking: Booking;
  onCancel: (id: number) => void;
  cancelling: boolean;
  readOnly?: boolean;
}) {
  const photo = booking.listing.photos[0]?.url;
  return (
    <div className="flex gap-4 border border-line rounded-2xl p-4">
      <Link href={`/listings/${booking.listing_id}`} className="shrink-0">
        <img src={photo} alt={booking.listing.title} className="w-32 h-32 rounded-xl object-cover" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/listings/${booking.listing_id}`} className="font-semibold hover:underline">
              {booking.listing.title}
            </Link>
            <p className="text-hint text-sm">
              {booking.listing.city}, {booking.listing.country}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              booking.status === "confirmed"
                ? "bg-green-50 text-green-700"
                : booking.status === "cancelled"
                ? "bg-neutral-100 text-hint"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {booking.status}
          </span>
        </div>
        <p className="text-sm mt-2">
          {format(new Date(booking.check_in + "T00:00:00"), "MMM d, yyyy")} –{" "}
          {format(new Date(booking.check_out + "T00:00:00"), "MMM d, yyyy")} · {booking.nights} night
          {booking.nights > 1 ? "s" : ""} · {booking.guests} guest{booking.guests > 1 ? "s" : ""}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="font-semibold text-sm">${booking.total_price.toFixed(0)} total</p>
          {!readOnly && booking.status === "confirmed" && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={cancelling}
              className="text-sm font-semibold underline disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Cancel booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
