"use client";

import { useEffect, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { Amenity } from "@/lib/types";

export interface Filters {
  min_price?: number;
  max_price?: number;
  room_type?: string;
  amenity_ids: number[];
}

const ROOM_TYPES = ["Entire place", "Private room"];

export default function FilterModal({
  filters,
  onApply,
}: {
  filters: Filters;
  onApply: (f: Filters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<Filters>(filters);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    api.get<Amenity[]>("/api/listings/meta/amenities").then(setAmenities).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  const activeCount =
    (filters.min_price ? 1 : 0) + (filters.max_price ? 1 : 0) + (filters.room_type ? 1 : 0) + filters.amenity_ids.length;

  function toggleAmenity(id: number) {
    setLocal((f) => ({
      ...f,
      amenity_ids: f.amenity_ids.includes(id) ? f.amenity_ids.filter((a) => a !== id) : [...f.amenity_ids, id],
    }));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-line rounded-xl px-4 py-2.5 text-sm font-semibold hover:shadow-pop transition-shadow relative"
      >
        <SlidersHorizontal size={14} />
        Filters
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-ink text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-white">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Price range per night</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-hint">Minimum</label>
                    <div className="flex items-center border border-line rounded-lg px-3 py-2 mt-1">
                      <span className="text-hint mr-1">$</span>
                      <input
                        type="number"
                        min={0}
                        value={local.min_price ?? ""}
                        onChange={(e) =>
                          setLocal((f) => ({ ...f, min_price: e.target.value ? Number(e.target.value) : undefined }))
                        }
                        placeholder="0"
                        className="w-full outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-hint">Maximum</label>
                    <div className="flex items-center border border-line rounded-lg px-3 py-2 mt-1">
                      <span className="text-hint mr-1">$</span>
                      <input
                        type="number"
                        min={0}
                        value={local.max_price ?? ""}
                        onChange={(e) =>
                          setLocal((f) => ({ ...f, max_price: e.target.value ? Number(e.target.value) : undefined }))
                        }
                        placeholder="1000+"
                        className="w-full outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Room type</h3>
                <div className="flex gap-2">
                  {ROOM_TYPES.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setLocal((f) => ({ ...f, room_type: f.room_type === rt ? undefined : rt }))}
                      className={`px-4 py-2 rounded-full border text-sm font-medium ${
                        local.room_type === rt ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                      }`}
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => toggleAmenity(a.id)}
                      className={`px-3 py-2.5 rounded-xl border text-sm text-left font-medium ${
                        local.amenity_ids.includes(a.id) ? "border-ink bg-neutral-50" : "border-line hover:border-ink"
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-line sticky bottom-0 bg-white">
              <button
                onClick={() => setLocal({ amenity_ids: [] })}
                className="text-sm font-semibold underline"
              >
                Clear all
              </button>
              <button
                onClick={() => {
                  onApply(local);
                  setOpen(false);
                }}
                className="bg-ink text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-black"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
