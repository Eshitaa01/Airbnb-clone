"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Shuffle } from "lucide-react";
import { api } from "@/lib/api";
import { Amenity, ListingDetail } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Loft", "Cabin", "Chalet", "Bungalow", "Houseboat", "Dome", "Penthouse", "Townhouse", "Cottage"];
const ROOM_TYPES = ["Entire place", "Private room", "Shared room"];

export interface ListingFormValues {
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  city: string;
  country: string;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenity_ids: number[];
  photo_urls: string[];
}

const EMPTY: ListingFormValues = {
  title: "",
  description: "",
  property_type: "Apartment",
  room_type: "Entire place",
  city: "",
  country: "",
  price_per_night: 100,
  cleaning_fee: 30,
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenity_ids: [],
  photo_urls: [],
};

export default function ListingForm({ existing }: { existing?: ListingDetail }) {
  const router = useRouter();
  const { show } = useToast();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [values, setValues] = useState<ListingFormValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Amenity[]>("/api/listings/meta/amenities").then(setAmenities).catch(() => {});
  }, []);

  useEffect(() => {
    if (existing) {
      setValues({
        title: existing.title,
        description: existing.description,
        property_type: existing.property_type,
        room_type: existing.room_type,
        city: existing.city,
        country: existing.country,
        price_per_night: existing.price_per_night,
        cleaning_fee: existing.cleaning_fee,
        max_guests: existing.max_guests,
        bedrooms: existing.bedrooms,
        beds: existing.beds,
        bathrooms: existing.bathrooms,
        amenity_ids: existing.amenities.map((a) => a.id),
        photo_urls: existing.photos.map((p) => p.url),
      });
    }
  }, [existing]);

  function set<K extends keyof ListingFormValues>(key: K, val: ListingFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function toggleAmenity(id: number) {
    setValues((v) => ({
      ...v,
      amenity_ids: v.amenity_ids.includes(id) ? v.amenity_ids.filter((a) => a !== id) : [...v.amenity_ids, id],
    }));
  }

  function addPhoto() {
    const seed = Math.random().toString(36).slice(2, 8);
    set("photo_urls", [...values.photo_urls, `https://picsum.photos/seed/${seed}/1200/900`]);
  }

  function removePhoto(idx: number) {
    set("photo_urls", values.photo_urls.filter((_, i) => i !== idx));
  }

  function shufflePhoto(idx: number) {
    const seed = Math.random().toString(36).slice(2, 8);
    const next = [...values.photo_urls];
    next[idx] = `https://picsum.photos/seed/${seed}/1200/900`;
    set("photo_urls", next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.title.trim() || !values.city.trim() || !values.country.trim()) {
      setError("Title, city, and country are required.");
      return;
    }
    if (values.photo_urls.length === 0) {
      setError("Add at least one photo.");
      return;
    }
    setSubmitting(true);
    try {
      if (existing) {
        await api.put(`/api/listings/${existing.id}`, values);
        show("Listing updated");
      } else {
        const created = await api.post<ListingDetail>("/api/listings", values);
        show("Listing published");
        router.push(`/listings/${created.id}`);
        return;
      }
      router.push("/host");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.del(`/api/listings/${existing.id}`);
      show("Listing deleted");
      router.push("/host");
    } catch {
      show("Could not delete listing", "error");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section>
        <h2 className="font-semibold text-lg mb-3">Basics</h2>
        <div className="space-y-3">
          <Field label="Title">
            <input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Sunlit loft with skyline views"
              className="input"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Tell guests what makes your place special…"
              className="input resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Property type">
              <select value={values.property_type} onChange={(e) => set("property_type", e.target.value)} className="input">
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Room type">
              <select value={values.room_type} onChange={(e) => set("room_type", e.target.value)} className="input">
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Location</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input value={values.city} onChange={(e) => set("city", e.target.value)} className="input" />
          </Field>
          <Field label="Country">
            <input value={values.country} onChange={(e) => set("country", e.target.value)} className="input" />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Space</h2>
        <div className="grid grid-cols-4 gap-3">
          <Field label="Guests">
            <input type="number" min={1} value={values.max_guests} onChange={(e) => set("max_guests", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Bedrooms">
            <input type="number" min={0} value={values.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Beds">
            <input type="number" min={1} value={values.beds} onChange={(e) => set("beds", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Baths">
            <input type="number" min={0.5} step={0.5} value={values.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} className="input" />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Pricing</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price per night ($)">
            <input type="number" min={1} value={values.price_per_night} onChange={(e) => set("price_per_night", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Cleaning fee ($)">
            <input type="number" min={0} value={values.cleaning_fee} onChange={(e) => set("cleaning_fee", Number(e.target.value))} className="input" />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Amenities</h2>
        <div className="grid grid-cols-2 gap-2">
          {amenities.map((a) => (
            <button
              type="button"
              key={a.id}
              onClick={() => toggleAmenity(a.id)}
              className={`px-3 py-2.5 rounded-xl border text-sm text-left font-medium ${
                values.amenity_ids.includes(a.id) ? "border-ink bg-neutral-50" : "border-line hover:border-ink"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Photos</h2>
        <div className="grid grid-cols-3 gap-3">
          {values.photo_urls.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button type="button" onClick={() => shufflePhoto(i)} className="p-1.5 bg-white rounded-full">
                  <Shuffle size={13} />
                </button>
                <button type="button" onClick={() => removePhoto(i)} className="p-1.5 bg-white rounded-full">
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPhoto}
            className="aspect-square rounded-xl border-2 border-dashed border-line hover:border-ink flex flex-col items-center justify-center gap-1 text-hint"
          >
            <Plus size={20} />
            <span className="text-xs">Add photo</span>
          </button>
        </div>
        <p className="text-hint text-xs mt-2">Demo uses placeholder photography — click a photo to reshuffle it.</p>
      </section>

      {error && <p className="text-rausch text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2 pb-10">
        <button type="submit" disabled={submitting} className="bg-rausch hover:bg-rausch-dark text-white rounded-xl px-6 py-3 font-semibold disabled:opacity-60">
          {submitting ? "Saving…" : existing ? "Save changes" : "Publish listing"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="border border-line rounded-xl px-6 py-3 font-semibold text-rausch hover:border-rausch disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete listing"}
          </button>
        )}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #dddddd;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #222222;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-hint mb-1 block">{label}</span>
      {children}
    </label>
  );
}
