"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ListingDetail } from "@/lib/types";
import ListingForm from "@/components/ListingForm";

export default function EditListingPage() {
  const params = useParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ListingDetail>(`/api/listings/${params.id}`)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 text-hint">Loading…</div>;
  if (!listing) return <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">Listing not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="font-display font-extrabold text-3xl mb-1">Edit listing</h1>
      <p className="text-hint mb-8">Update your listing details, photos, or pricing.</p>
      <ListingForm existing={listing} />
    </div>
  );
}
