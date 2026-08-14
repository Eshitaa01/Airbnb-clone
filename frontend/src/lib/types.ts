export interface UserT {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  is_host: boolean;
  is_superhost: boolean;
  bio: string;
}

export interface Photo {
  id: number;
  url: string;
  sort_order: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: UserT;
}

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  country: string;
  property_type: string;
  room_type: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  photos: Photo[];
  avg_rating: number | null;
  review_count: number;
  is_wishlisted?: boolean;
}

export interface ListingDetail extends ListingCard {
  description: string;
  lat: number;
  lng: number;
  cleaning_fee: number;
  service_fee_pct: number;
  host: UserT;
  amenities: Amenity[];
  reviews: Review[];
  booked_ranges: { check_in: string; check_out: string }[];
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_total: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: string;
  created_at: string;
  listing: ListingCard;
}

export interface SearchParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  room_type?: string;
  amenity_ids?: string;
  page?: number;
  page_size?: number;
}

export interface SearchResult {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
