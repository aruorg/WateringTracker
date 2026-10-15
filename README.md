# Watering Tracker

Track your plants and how often each one needs watering. Guests get an anonymous Supabase session (no login form); all record operations go through the Express API.

## Contract

**Table:** `public.items`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | uuid | primary key, `default gen_random_uuid()` |
| `owner_id` | uuid | not null, references `auth.users(id)`, set by the server from the verified JWT |
| `plant_name` | text | not null, trimmed, 1–100 characters |
| `water_every_days` | integer | not null, between 1 and 60 |
| `created_at` | timestamptz | not null, `default now()` |

**Record JSON:**

```json
{
  "id": "database-generated-uuid",
  "owner_id": "verified-guest-user-id",
  "plant_name": "Monstera",
  "water_every_days": 7,
  "created_at": "database-generated-timestamp"
}
```

The browser sends only `plant_name` and `water_every_days`. The server adds `owner_id`. The database generates `id` and `created_at`.

**Endpoints** (all require `Authorization: Bearer <access_token>`):

| Method | Endpoint | Success | Errors |
| --- | --- | --- | --- |
| GET | `/api/items` | 200, JSON array (newest first) | 401, 500 |
| POST | `/api/items` | 201, the created record | 400, 401, 500 |
| DELETE | `/api/items/:id` | 204, no body | 401, 404, 500 |

Error body: `{ "error": "A useful message" }`

**Dev URLs:** client `http://localhost:5173`, server `http://localhost:3000`

## Running the client

```
cd client
npm install
cp .env.example .env.local   # then fill in the Supabase URL and publishable key
npm run dev
```

## Running the server

```
cd server
npm install
cp .env.example .env         # then fill in the Supabase URL and publishable key
npm run dev
```

The server uses only the publishable key. Each request runs its queries with the guest's own JWT, so row-level security applies on top of the `owner_id` filters in the backend.
