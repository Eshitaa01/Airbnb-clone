"""Seed the SQLite database with demo hosts, guests, listings, photos,
amenities, bookings and reviews so the app is immediately usable.

Run with:  python -m app.seed
"""
import os
from datetime import date, timedelta
import random

from .database import Base, engine, SessionLocal
from . import models

random.seed(42)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "airbnb.db")


AMENITIES = [
    ("Wifi", "wifi"), ("Kitchen", "kitchen"), ("Washer", "washer"), ("Dryer", "dryer"),
    ("Free parking", "parking"), ("Air conditioning", "ac"), ("Pool", "pool"), ("Hot tub", "hot-tub"),
    ("Gym", "gym"), ("Workspace", "desk"), ("TV", "tv"), ("Fireplace", "fireplace"),
    ("Pets allowed", "pets"), ("Beach access", "beach"), ("Mountain view", "mountain"),
    ("Breakfast", "breakfast"), ("EV charger", "ev"), ("Balcony", "balcony"),
]

HOSTS = [
    {"name": "Marisol Ortega", "email": "marisol@example.com", "bio": "Hosting sunny getaways since 2018.", "avatar_url": "https://i.pravatar.cc/150?img=32"},
    {"name": "Jamie Fontaine", "email": "jamie@example.com", "bio": "Design lover with a passion for hospitality.", "avatar_url": "https://i.pravatar.cc/150?img=15"},
    {"name": "Kenji Watanabe", "email": "kenji@example.com", "bio": "Third-generation innkeeper in the mountains.", "avatar_url": "https://i.pravatar.cc/150?img=53"},
    {"name": "Aisha Bello", "email": "aisha@example.com", "bio": "I love showing guests the best of the city.", "avatar_url": "https://i.pravatar.cc/150?img=47"},
    {"name": "Lucas Meyer", "email": "lucas@example.com", "bio": "Renovated lofts with a modern touch.", "avatar_url": "https://i.pravatar.cc/150?img=12"},
]

GUESTS = [
    {"name": "Priya Sharma", "email": "priya@example.com", "avatar_url": "https://i.pravatar.cc/150?img=5"},
    {"name": "Tom Richards", "email": "tom@example.com", "avatar_url": "https://i.pravatar.cc/150?img=8"},
    {"name": "Elena Petrova", "email": "elena@example.com", "avatar_url": "https://i.pravatar.cc/150?img=9"},
]

# (title, city, country, property_type, room_type, price, guests, beds, bedrooms, baths, lat, lng, photo_seed)
LISTINGS = [
    ("Sunlit Loft in the Heart of Le Marais", "Paris", "France", "Loft", "Entire place", 189, 4, 2, 1, 1.0, 48.8566, 2.3522, "paris1"),
    ("Cozy Studio near the Eiffel Tower", "Paris", "France", "Apartment", "Entire place", 129, 2, 1, 1, 1.0, 48.8584, 2.2945, "paris2"),
    ("Modern Flat with Seine River Views", "Paris", "France", "Apartment", "Entire place", 245, 4, 2, 2, 2.0, 48.8530, 2.3499, "paris3"),
    ("Charming Brooklyn Brownstone", "New York", "United States", "Townhouse", "Entire place", 310, 6, 3, 3, 2.5, 40.6782, -73.9442, "nyc1"),
    ("Chic Studio in the West Village", "New York", "United States", "Apartment", "Entire place", 175, 2, 1, 1, 1.0, 40.7358, -74.0036, "nyc2"),
    ("Private Room in Sunny Williamsburg", "New York", "United States", "Apartment", "Private room", 89, 1, 1, 1, 1.0, 40.7081, -73.9571, "nyc3"),
    ("Skyline Penthouse with Rooftop Deck", "New York", "United States", "Penthouse", "Entire place", 520, 6, 3, 2, 3.0, 40.7484, -73.9857, "nyc4"),
    ("Traditional Machiya House in Gion", "Kyoto", "Japan", "House", "Entire place", 220, 4, 2, 2, 1.5, 35.0037, 135.7788, "kyoto1"),
    ("Minimalist Ryokan-Style Suite", "Kyoto", "Japan", "Apartment", "Entire place", 150, 2, 1, 1, 1.0, 35.0116, 135.7681, "kyoto2"),
    ("Bamboo Grove Cottage", "Kyoto", "Japan", "Cottage", "Entire place", 175, 3, 2, 1, 1.0, 35.0170, 135.6761, "kyoto3"),
    ("Beachfront Villa with Infinity Pool", "Bali", "Indonesia", "Villa", "Entire place", 340, 8, 4, 4, 4.0, -8.6500, 115.1330, "bali1"),
    ("Jungle Bungalow with Private Pool", "Bali", "Indonesia", "Bungalow", "Entire place", 145, 2, 1, 1, 1.0, -8.5069, 115.2625, "bali2"),
    ("Rice Terrace View Cabin", "Bali", "Indonesia", "Cabin", "Entire place", 98, 2, 1, 1, 1.0, -8.4095, 115.1889, "bali3"),
    ("Historic Flat off Portobello Road", "London", "United Kingdom", "Apartment", "Entire place", 210, 4, 2, 1, 1.0, 51.5175, -0.2033, "london1"),
    ("Design-Forward Shoreditch Loft", "London", "United Kingdom", "Loft", "Entire place", 265, 4, 2, 2, 2.0, 51.5265, -0.0786, "london2"),
    ("Riverside Cottage in the Cotswolds", "London", "United Kingdom", "Cottage", "Entire place", 195, 5, 3, 2, 2.0, 51.8330, -1.8433, "london3"),
    ("Sun-Drenched Roof Terrace Apartment", "Barcelona", "Spain", "Apartment", "Entire place", 155, 4, 2, 1, 1.0, 41.3874, 2.1686, "bcn1"),
    ("Gothic Quarter Boutique Studio", "Barcelona", "Spain", "Apartment", "Entire place", 110, 2, 1, 1, 1.0, 41.3833, 2.1769, "bcn2"),
    ("Beach House near Barceloneta", "Barcelona", "Spain", "House", "Entire place", 280, 6, 3, 3, 2.0, 41.3784, 2.1925, "bcn3"),
    ("Desert Modern A-Frame Cabin", "Joshua Tree", "United States", "Cabin", "Entire place", 165, 4, 2, 1, 1.0, 34.1347, -116.3131, "jtree1"),
    ("Stargazer Dome under the Milky Way", "Joshua Tree", "United States", "Dome", "Entire place", 140, 2, 1, 1, 1.0, 34.1417, -116.0842, "jtree2"),
    ("Alpine Chalet with Hot Tub", "Aspen", "United States", "Chalet", "Entire place", 450, 8, 4, 3, 3.0, 39.1911, -106.8175, "aspen1"),
    ("Cozy Ski-In Ski-Out Cabin", "Aspen", "United States", "Cabin", "Entire place", 380, 6, 3, 2, 2.0, 39.1802, -106.8500, "aspen2"),
    ("Canal House with Private Garden", "Amsterdam", "Netherlands", "House", "Entire place", 230, 4, 2, 2, 1.5, 52.3702, 4.8952, "ams1"),
    ("Houseboat on the Amstel River", "Amsterdam", "Netherlands", "Houseboat", "Entire place", 190, 2, 1, 1, 1.0, 52.3560, 4.9014, "ams2"),
    ("Trulli Stone House in the Valley", "Puglia", "Italy", "House", "Entire place", 160, 4, 2, 2, 1.5, 40.7770, 17.2333, "puglia1"),
    ("Seaside Terrace Villa", "Puglia", "Italy", "Villa", "Entire place", 275, 6, 3, 3, 2.0, 40.4640, 17.9500, "puglia2"),
    ("Colorful Casa in Roma Norte", "Mexico City", "Mexico", "Apartment", "Entire place", 95, 3, 2, 1, 1.0, 19.4194, -99.1677, "cdmx1"),
    ("Rooftop Terrace Loft in Condesa", "Mexico City", "Mexico", "Loft", "Entire place", 120, 3, 1, 1, 1.0, 19.4100, -99.1731, "cdmx2"),
    ("Table Mountain View Apartment", "Cape Town", "South Africa", "Apartment", "Entire place", 105, 4, 2, 1, 1.0, -33.9249, 18.4241, "capetown1"),
]

REVIEW_COMMENTS = [
    "Absolutely stunning place, exactly as pictured. The host was incredibly responsive!",
    "Great location and super clean. Would stay again in a heartbeat.",
    "Loved the neighborhood and the little touches like fresh coffee and local tips.",
    "Comfortable beds, quiet street, and an easy check-in process.",
    "Beautiful views and a very well-equipped kitchen. Highly recommend.",
    "The photos don't do it justice - even nicer in person.",
    "Perfect for our trip, close to everything we wanted to see.",
    "Host went above and beyond to make sure we were comfortable.",
]


def run():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    amenities = []
    for name, icon in AMENITIES:
        a = models.Amenity(name=name, icon=icon)
        db.add(a)
        amenities.append(a)
    db.flush()

    hosts = []
    for h in HOSTS:
        u = models.User(is_host=True, is_superhost=random.random() > 0.5, **h)
        db.add(u)
        hosts.append(u)

    guests = []
    for g in GUESTS:
        u = models.User(is_host=False, **g)
        db.add(u)
        guests.append(u)
    db.flush()

    listings = []
    for i, item in enumerate(LISTINGS):
        (title, city, country, ptype, rtype, price, max_guests, beds, bedrooms, baths, lat, lng, seed) = item
        host = hosts[i % len(hosts)]
        listing = models.Listing(
            host_id=host.id,
            title=title,
            description=(
                f"Escape to this beautiful {ptype.lower()} in {city}. Enjoy a bright, thoughtfully "
                f"furnished space with everything you need for a relaxing stay - just steps from top "
                f"restaurants, sights, and local favorites. Perfect for {max_guests} guests looking for "
                f"comfort and character."
            ),
            property_type=ptype,
            room_type=rtype,
            city=city,
            country=country,
            lat=lat,
            lng=lng,
            price_per_night=price,
            cleaning_fee=round(price * 0.2, 2),
            service_fee_pct=0.12,
            max_guests=max_guests,
            bedrooms=bedrooms,
            beds=beds,
            bathrooms=baths,
        )
        listing.amenities = random.sample(amenities, k=random.randint(5, 9))
        db.add(listing)
        db.flush()
        for p in range(5):
            db.add(models.Photo(listing_id=listing.id, url=f"https://picsum.photos/seed/{seed}-{p}/1200/900", sort_order=p))
        listings.append(listing)

    db.flush()

    # Seed some existing bookings (mix of past/completed and upcoming) so the app feels alive
    today = date.today()
    for listing in listings:
        if random.random() < 0.6:
            guest = random.choice(guests)
            offset = random.randint(20, 90)
            ci = today + timedelta(days=offset)
            co = ci + timedelta(days=random.randint(2, 6))
            nights = (co - ci).days
            nightly_total = round(nights * listing.price_per_night, 2)
            service_fee = round(nightly_total * listing.service_fee_pct, 2)
            total = round(nightly_total + listing.cleaning_fee + service_fee, 2)
            db.add(models.Booking(
                listing_id=listing.id, guest_id=guest.id, check_in=ci.isoformat(), check_out=co.isoformat(),
                guests=random.randint(1, listing.max_guests), nights=nights, nightly_total=nightly_total,
                cleaning_fee=listing.cleaning_fee, service_fee=service_fee, total_price=total, status="confirmed",
            ))
        # a past, completed stay with a review
        if random.random() < 0.85:
            guest = random.choice(guests)
            offset = random.randint(30, 200)
            ci = today - timedelta(days=offset)
            co = ci + timedelta(days=random.randint(2, 5))
            nights = (co - ci).days
            nightly_total = round(nights * listing.price_per_night, 2)
            service_fee = round(nightly_total * listing.service_fee_pct, 2)
            total = round(nightly_total + listing.cleaning_fee + service_fee, 2)
            past_booking = models.Booking(
                listing_id=listing.id, guest_id=guest.id, check_in=ci.isoformat(), check_out=co.isoformat(),
                guests=random.randint(1, listing.max_guests), nights=nights, nightly_total=nightly_total,
                cleaning_fee=listing.cleaning_fee, service_fee=service_fee, total_price=total, status="completed",
            )
            db.add(past_booking)
            db.flush()
            for _ in range(random.randint(1, 3)):
                reviewer = random.choice(guests)
                db.add(models.Review(
                    listing_id=listing.id, booking_id=past_booking.id, author_id=reviewer.id,
                    rating=random.choice([4, 4, 5, 5, 5, 3]), comment=random.choice(REVIEW_COMMENTS),
                ))

    db.commit()
    db.close()
    print(f"Seeded {len(hosts)} hosts, {len(guests)} guests, {len(listings)} listings.")


if __name__ == "__main__":
    run()
