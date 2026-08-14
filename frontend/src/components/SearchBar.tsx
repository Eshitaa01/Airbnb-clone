"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Search, MapPin, Minus, Plus } from "lucide-react";
import { format } from "date-fns";

const POPULAR_DESTINATIONS = [
  "Paris, France", "New York, United States", "Kyoto, Japan", "Bali, Indonesia",
  "London, United Kingdom", "Barcelona, Spain", "Joshua Tree, United States",
  "Aspen, United States", "Amsterdam, Netherlands", "Puglia, Italy",
  "Mexico City, Mexico", "Cape Town, South Africa",
];

type Panel = "where" | "dates" | "who" | null;

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [location, setLocation] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const dateLabel = range?.from
    ? range.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
      : format(range.from, "MMM d")
    : "Any week";

  function handleSearch() {
  if (range?.from && range?.to && range.to <= range.from) {
    alert("Check-out date must be after check-in date.");
    return;
  }

  const params = new URLSearchParams();

  if (location) {
    params.set("location", location);
  }

  if (range?.from) {
    params.set("check_in", format(range.from, "yyyy-MM-dd"));
  }

  if (range?.to) {
    params.set("check_out", format(range.to, "yyyy-MM-dd"));
  }

  if (guests > 1) {
    params.set("guests", String(guests));
  }

  setOpenPanel(null);
  router.push(`/?${params.toString()}`);
}

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      <div
        className={`flex items-stretch bg-white border border-line rounded-full shadow-pop hover:shadow-card transition-shadow ${
          compact ? "h-12 text-sm" : "h-16 text-sm"
        }`}
      >
        <button
          onClick={() => setOpenPanel(openPanel === "where" ? null : "where")}
          className={`flex-1 min-w-0 flex flex-col justify-center px-6 rounded-full text-left hover:bg-neutral-100 transition-colors ${
            openPanel === "where" ? "bg-neutral-100" : ""
          }`}
        >
          <span className="font-semibold text-xs">Where</span>
          <span className="text-hint truncate">{location || "Search destinations"}</span>
        </button>
        <div className="w-px bg-line my-2" />
        <button
          onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}
          className={`flex-1 min-w-0 flex flex-col justify-center px-6 rounded-full text-left hover:bg-neutral-100 transition-colors ${
            openPanel === "dates" ? "bg-neutral-100" : ""
          }`}
        >
          <span className="font-semibold text-xs">When</span>
          <span className="text-hint truncate">{dateLabel}</span>
        </button>
        <div className="w-px bg-line my-2" />
        <button
          onClick={() => setOpenPanel(openPanel === "who" ? null : "who")}
          className={`flex-1 min-w-0 flex items-center justify-between pl-6 pr-2 rounded-full text-left hover:bg-neutral-100 transition-colors ${
            openPanel === "who" ? "bg-neutral-100" : ""
          }`}
        >
          <span className="min-w-0">
            <span className="font-semibold text-xs block">Who</span>
            <span className="text-hint truncate block">{guests > 1 ? `${guests} guests` : "Add guests"}</span>
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleSearch();
            }}
            className="bg-rausch hover:bg-rausch-dark text-white rounded-full p-3 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <Search size={compact ? 14 : 16} strokeWidth={3} />
          </span>
        </button>
      </div>

      {openPanel && (
        <div className="absolute top-full mt-3 left-0 right-0 bg-white rounded-3xl shadow-card border border-line p-6 animate-slide-up z-50">
          {openPanel === "where" && (
            <div>
              <p className="text-xs font-semibold text-hint mb-3">Search by city or country</p>
              <div className="relative mb-4">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hint" />
                <input
                  autoFocus
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Paris, Bali, New York"
                  className="w-full border border-line rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-ink"
                />
              </div>
              <p className="text-xs font-semibold text-hint mb-2">Popular destinations</p>
              <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto">
                {POPULAR_DESTINATIONS.filter((d) => d.toLowerCase().includes(location.toLowerCase())).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setLocation(d);
                      setOpenPanel("dates");
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 text-left text-sm"
                  >
                    <span className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <MapPin size={14} className="text-hint" />
                    </span>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {openPanel === "dates" && (
            <div className="flex justify-center">
              <DayPicker
                mode="range"
                numberOfMonths={2}
                selected={range}
                onSelect={setRange}
                min={1}
                disabled={{ before: new Date() }}
                className="!m-0"
              />
            </div>
          )}

          {openPanel === "who" && (
            <div className="max-w-xs">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">Guests</p>
                  <p className="text-hint text-xs">Ages 2 and above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-ink disabled:opacity-30 disabled:hover:border-line"
                    disabled={guests <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center">{guests}</span>
                  <button
                    onClick={() => setGuests((g) => Math.min(16, g + 1))}
                    className="w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-ink"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="mt-3 w-full bg-rausch hover:bg-rausch-dark text-white rounded-xl py-2.5 font-semibold"
              >
                Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
