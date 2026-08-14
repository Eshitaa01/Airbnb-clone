export default function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl2 bg-neutral-200" />
      <div className="mt-2 h-3.5 w-3/4 bg-neutral-200 rounded" />
      <div className="mt-2 h-3.5 w-1/2 bg-neutral-200 rounded" />
      <div className="mt-2 h-3.5 w-1/3 bg-neutral-200 rounded" />
    </div>
  );
}
