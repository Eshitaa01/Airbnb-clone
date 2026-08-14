import ListingForm from "@/components/ListingForm";

export default function NewListingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="font-display font-extrabold text-3xl mb-1">Create a new listing</h1>
      <p className="text-hint mb-8">Fill in the details below — you can edit everything later.</p>
      <ListingForm />
    </div>
  );
}
