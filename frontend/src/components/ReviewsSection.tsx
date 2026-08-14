import { Star } from "lucide-react";
import { Review } from "@/lib/types";
import { format } from "date-fns";

export default function ReviewsSection({
  reviews,
  avgRating,
}: {
  reviews: Review[];
  avgRating: number | null;
}) {
  if (reviews.length === 0) {
    return (
      <div className="py-8 border-t border-line">
        <h2 className="font-semibold text-xl mb-2">No reviews yet</h2>
        <p className="text-hint text-sm">This listing hasn&apos;t received any reviews yet. Be the first to stay and share your experience.</p>
      </div>
    );
  }

  return (
    <div className="py-8 border-t border-line">
      <h2 className="font-semibold text-xl mb-6 flex items-center gap-2">
        <Star size={18} className="fill-ink" />
        {avgRating} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
      </h2>
      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
        {reviews.slice(0, 8).map((r) => (
          <div key={r.id}>
            <div className="flex items-center gap-3 mb-2">
              <img src={r.author.avatar_url} alt={r.author.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-sm">{r.author.name}</p>
                <p className="text-hint text-xs">{format(new Date(r.created_at), "MMMM yyyy")}</p>
              </div>
            </div>
            <p className="text-sm text-charcoal leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
