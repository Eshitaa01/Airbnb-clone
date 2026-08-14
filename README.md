# airhome — Airbnb Web App Clone

A full-stack clone of the Airbnb web app: browse/search listings, view listing
details, book stays with date-range validation, manage bookings in "My
Trips," and run a full host CRUD workflow with a host dashboard.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database:** SQLite (file-based, seeded on demand)

---

## 1. Quick start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python -m app.seed          # creates & seeds airbnb.db (idempotent - drops/recreates)
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs (Swagger UI)
are available at `http://localhost:8000/docs`.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local   # already included as .env.local, edit if your API runs elsewhere
npm run dev
```

Open `http://localhost:3000`.

> The frontend reads the API base URL from `NEXT_PUBLIC_API_URL` in
> `frontend/.env.local` (defaults to `http://localhost:8000`).

### Using the app
- No real sign-up/login is implemented (per the assignment's "mocked auth"
  allowance). Instead, click the menu icon (top right) → **"Switch account
  (demo)"** to act as any of the 8 seeded users (5 hosts, 3 guests).
- Any guest can click **"Become a host"** in the same menu to unlock the host
  dashboard and start creating listings immediately.

---

## 2. Tech stack

| Layer      | Choice                                    | Why |
|------------|--------------------------------------------|-----|
| Frontend   | Next.js 14 (App Router), TypeScript       | File-based routing, React Server/Client Components, fast dev loop |
| Styling    | Tailwind CSS                               | Rapid, consistent utility styling matched to an Airbnb-like design token set |
| Date picker| `react-day-picker` + `date-fns`            | Lightweight range picker for booking & search |
| Icons      | `lucide-react`                             | Clean, consistent icon set |
| Backend    | FastAPI                                    | Async-ready, automatic OpenAPI docs, strong typing via Pydantic |
| ORM        | SQLAlchemy 2.0                             | Explicit schema, relationships, easy to reason about |
| DB         | SQLite                                     | Zero-config, file-based, matches assignment spec |

---

## 3. Architecture overview

```
airbnb-clone/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registration
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   ├── models.py        # ORM models (schema)
│   │   ├── schemas.py       # Pydantic request/response models
│   │   ├── deps.py          # Mocked-auth dependency (reads X-User-Id header)
│   │   ├── seed.py          # Seed script (demo hosts/guests/listings/bookings/reviews)
│   │   └── routers/
│   │       ├── listings.py  # Search/filter/detail/CRUD + reviews
│   │       ├── bookings.py  # Create/list/cancel bookings, overlap validation
│   │       ├── host.py      # Host dashboard: owned listings + their bookings
│   │       ├── users.py     # Demo user list, "become a host"
│   │       └── wishlist.py  # Toggle & list wishlist
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx               # Home / explore (search + grid + pagination)
        │   ├── listings/[id]/page.tsx # Listing detail + booking widget
        │   ├── trips/page.tsx         # My Trips
        │   ├── wishlist/page.tsx      # Wishlist
        │   └── host/                  # Host dashboard, create/edit listing forms
        ├── components/                # Navbar, SearchBar, ListingCard, BookingWidget, etc.
        ├── context/                   # UserContext (mocked auth), ToastContext
        └── lib/                       # API client, shared types
```

**Authentication (mocked):** Per the assignment's guidance that real auth can
be simplified, the frontend keeps a "current user id" in `localStorage` and
sends it as an `X-User-Id` header on every API call. The backend resolves
this into a `User` row via a FastAPI dependency (`deps.get_current_user`).
Switching "accounts" from the navbar menu just updates that id — there are no
passwords or sessions. `is_host` is a boolean per user; any guest can flip it
on via "Become a host."

**Booking integrity:** availability is enforced server-side in
`routers/bookings.py` — a new booking is rejected (409) if its date range
overlaps any existing non-cancelled booking for that listing. The listing
detail and search endpoints also return/filter on `booked_ranges` so the UI
can disable already-booked dates in the date picker and exclude fully-booked
listings from date-filtered search results.

---

## 4. Database schema

```
users
├─ id (PK)
├─ name, email (unique), avatar_url, bio
├─ is_host, is_superhost
└─ created_at

listings
├─ id (PK)
├─ host_id (FK → users.id)
├─ title, description, property_type, room_type
├─ city, country, lat, lng
├─ price_per_night, cleaning_fee, service_fee_pct
├─ max_guests, bedrooms, beds, bathrooms
├─ is_active
└─ created_at

photos
├─ id (PK)
├─ listing_id (FK → listings.id)
├─ url, sort_order

amenities
├─ id (PK)
├─ name (unique), icon

listing_amenities (association table)
├─ listing_id (FK), amenity_id (FK)

bookings
├─ id (PK)
├─ listing_id (FK → listings.id)
├─ guest_id (FK → users.id)
├─ check_in, check_out (ISO date strings)
├─ guests, nights
├─ nightly_total, cleaning_fee, service_fee, total_price
├─ status (confirmed | cancelled | completed)
└─ created_at

reviews
├─ id (PK)
├─ listing_id (FK), booking_id (FK, nullable), author_id (FK → users.id)
├─ rating (1–5), comment
└─ created_at

wishlist
├─ id (PK)
├─ user_id (FK), listing_id (FK)
└─ created_at
```

Relationships: a `User` can be a host of many `Listing`s and a guest on many
`Booking`s; a `Listing` has many `Photo`s, a many-to-many set of `Amenity`s,
many `Booking`s, and many `Review`s. Cascading deletes are configured so
deleting a listing (or user) cleans up its dependent rows.

---

## 5. API overview

All endpoints are prefixed `/api`. Full interactive schema at `/docs`.

| Method | Path                              | Description |
|--------|------------------------------------|--------------|
| GET    | `/listings`                        | Search/filter/paginate listings (location, dates, guests, price, type, amenities) |
| GET    | `/listings/{id}`                   | Listing detail incl. amenities, reviews, host, booked date ranges |
| POST   | `/listings`                        | Create a listing (host only) |
| PUT    | `/listings/{id}`                   | Update a listing (owner only) |
| DELETE | `/listings/{id}`                   | Delete a listing (owner only) |
| POST   | `/listings/{id}/reviews`           | Leave a review |
| GET    | `/listings/meta/amenities`         | List all amenities (for filters/forms) |
| POST   | `/bookings`                        | Create a booking (validates dates, guest count, overlap) |
| GET    | `/bookings/mine`                   | Current user's bookings ("My Trips") |
| POST   | `/bookings/{id}/cancel`             | Cancel a booking |
| GET    | `/host/listings`                   | Listings owned by current host |
| GET    | `/host/bookings`                   | Bookings across the current host's listings |
| GET    | `/users`                           | List demo accounts (for the account switcher) |
| GET    | `/users/me`                        | Current user |
| POST   | `/users/me/become-host`             | Flip `is_host` on for current user |
| GET    | `/wishlist`                        | Current user's wishlist |
| POST   | `/wishlist/toggle`                 | Add/remove a listing from wishlist |

Auth: every write endpoint (and any endpoint needing "current user") expects
an `X-User-Id: <id>` header. The frontend sets this automatically once a demo
account is selected.

---

## 6. Feature checklist (per assignment spec)

- [x] Home/explore grid with photo, title, location, price, rating
- [x] Search bar (location + date range + guests)
- [x] Category row & filters (price range, property type, room type, amenities)
- [x] "Show more" pagination
- [x] Listing detail: gallery, description, amenities, host info, availability calendar, price breakdown, reviews
- [x] End-to-end booking flow with overlap/date/guest-count validation
- [x] Booking summary + mocked checkout/confirmation (toast + redirect to My Trips)
- [x] My Trips view; bookings persist and block those dates on the listing
- [x] Full host CRUD (create/edit/delete listings, manage photos/amenities/pricing)
- [x] Host dashboard: owned listings + bookings across them
- [x] Wishlist (heart toggle everywhere a card appears)
- [x] Toast notifications throughout
- [x] Seeded database: 5 hosts, 3 guests, 30 listings across 12 cities, photos, existing bookings, reviews
- [x] Responsive grid (2–5 columns depending on breakpoint)

**Explicitly mocked / placeholder**, as allowed by the assignment:
- Payments — booking is "confirmed" immediately, no payment form
- Messaging between guest and host — not implemented
- Real-time interactive map — a static preview panel with a pin overlay stands in for a map library
- Identity verification — not implemented
- Authentication — simplified to a demo "switch account" header-based scheme

---

## 7. Assumptions

- One `guests` figure is captured on booking (no separate adults/children/infants breakdown), matching the schema's `max_guests` capacity check.
- Photos are represented as URLs. The host form uses placeholder photography (`picsum.photos`) with a "shuffle" action rather than real file upload, since real image hosting is out of scope.
- "Completed" bookings are seeded in the past automatically; there's no background job that flips `confirmed` bookings to `completed` after checkout — this is a demo simplification.
- Reviews can be left independent of a specific booking via the API, though the UI currently surfaces existing reviews rather than a "leave a review" composer (listed as a bonus item in the spec).
- Server-side pagination uses simple offset/limit (`page`/`page_size`); given the small seeded dataset this is sufficient without needing cursor-based pagination.

---

## 8. Deployment notes

- **Backend:** any Python host (Render, Railway, Fly.io). Set the start
  command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT` and run
  `python -m app.seed` once during release/build to populate the SQLite file
  (or swap `DATABASE_URL` for a managed Postgres and adjust `database.py`
  for production use).
- **Frontend:** Vercel/Netlify. Set `NEXT_PUBLIC_API_URL` to your deployed
  backend's URL as a build-time env var, then `npm run build`.
- Update the FastAPI `CORSMiddleware` `allow_origins` to your deployed
  frontend origin instead of `"*"` for production.
=======
# Airbnb-clone
Airbnb Clone is a full-stack vacation rental platform built with React, FastAPI, SQLite, and SQLAlchemy. It enables users to search properties, filter listings, view detailed property information, manage wishlists, make bookings, and explore host-managed accommodations through a responsive, Airbnb-inspired interface.