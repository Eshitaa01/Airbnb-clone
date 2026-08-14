"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { differenceInCalendarDays, format } from "date-fns";
import { Star, Minus, Plus } from "lucide-react";
import { ListingDetail } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

export default function BookingWidget({ listing }: { listing: ListingDetail }) {
  const { user } = useUser();
  const { show } = useToast();
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabledRanges = useMemo(
    () =>
      listing.booked_ranges.map((r) => ({
        from: new Date(r.check_in + "T00:00:00"),
        to: new Date(new Date(r.check_out + "T00:00:00").getTime() - 86400000),
      })),
    [listing.booked_ranges]
  );

  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const nightlyTotal = nights * listing.price_per_night;
  const serviceFee = nightlyTotal * listing.service_fee_pct;
  const total = nightlyTotal + (nights ? listing.cleaning_fee : 0) + serviceFee;

  async function handleReserve() {
    setError(null);
    if (!user) {
      setError("Please select a demo account from the menu to book.");
      return;
    }
    if (!range?.from || !range?.to) {
      setError("Add your travel dates to continue.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/bookings", {
        listing_id: listing.id,
        check_in: format(range.from, "yyyy-MM-dd"),
        check_out: format(range.to, "yyyy-MM-dd"),
        guests,
      });
      show("Booking confirmed! Check My Trips for details.");
      router.push("/trips");
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-line rounded-2xl shadow-card p-6 sticky top-24">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-lg">
          <span className="font-semibold">${listing.price_per_night.toFixed(0)}</span> night
        </p>
        {listing.avg_rating && (
          <span className="flex items-center gap-1 text-sm">
            <Star size={13} className="fill-ink" />
            {listing.avg_rating} · {listing.review_count} review{listing.review_count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="border border-line rounded-xl overflow-hidden">
        <button
          onClick={() => setShowCalendar((s) => !s)}
          className="w-full grid grid-cols-2 text-left"
        >
          <div className="px-3 py-2 border-r border-b border-line">
            <p className="text-[10px] font-semibold uppercase">Check-in</p>
            <p className="text-sm">{range?.from ? format(range.from, "MMM d, yyyy") : "Add date"}</p>
          </div>
          <div className="px-3 py-2 border-b border-line">
            <p className="text-[10px] font-semibold uppercase">Checkout</p>
            <p className="text-sm">{range?.to ? format(range.to, "MMM d, yyyy") : "Add date"}</p>
          </div>
        </button>
        <div className="px-3 py-2">
          <p className="text-[10px] font-semibold uppercase">Guests</p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-sm">
              {guests} guest{guests > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="w-6 h-6 rounded-full border border-line flex items-center justify-center hover:border-ink disabled:opacity-30"
                disabled={guests <= 1}
              >
                <Minus size={12} />
              </button>
              <span className="w-3 text-center text-sm">{guests}</span>
              <button
                onClick={() => setGuests((g) => Math.min(listing.max_guests, g + 1))}
                className="w-6 h-6 rounded-full border border-line flex items-center justify-center hover:border-ink disabled:opacity-30"
                disabled={guests >= listing.max_guests}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          <p className="text-hint text-[11px] mt-0.5">Max {listing.max_guests} guests</p>
        </div>
      </div>

      {showCalendar && (
        <div className="mt-3 border border-line rounded-xl p-3 flex justify-center animate-slide-up overflow-x-auto">
          <DayPicker
            mode="range"
            numberOfMonths={1}
            selected={range}
            onSelect={setRange}
            disabled={[{ before: new Date() }, ...disabledRanges]}
          />
        </div>
      )}

      {error && <p className="text-rausch text-sm mt-3">{error}</p>}

      <button
        onClick={handleReserve}
        disabled={submitting}
        className="w-full bg-rausch hover:bg-rausch-dark text-white rounded-xl py-3.5 font-semibold mt-4 disabled:opacity-60"
      >
        {submitting ? "Reserving…" : nights ? "Reserve" : "Check availability"}
      </button>
      <p className="text-center text-hint text-xs mt-2">You won&apos;t be charged yet</p>

      {nights > 0 && (
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="underline">
              ${listing.price_per_night.toFixed(0)} x {nights} night{nights > 1 ? "s" : ""}
            </span>
            <span>${nightlyTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>${listing.cleaning_fee.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Service fee</span>
            <span>${serviceFee.toFixed(0)}</span>
          </div>
          <div className="border-t border-line pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
