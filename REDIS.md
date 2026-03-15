# Redis Integration — MyShow

## Setup

**Package:** `ioredis`
**Config file:** `backend/config/redis.js`
**Connection:** `REDIS_URL` env variable (default: `redis://localhost:6379`)

```
REDIS_URL=redis://localhost:6379   ← development (local)
REDIS_URL=rediss://...             ← production (Redis Cloud / Upstash TLS)
```

The client uses `lazyConnect` and a retry strategy — if Redis is unavailable it
logs the error but does **not** crash the server.

---

## 1. Seat Locking

**Files:** `backend/controllers/bookingControllers.js`
**Replaces:** MongoDB atomic `occupiedSeats` update + Inngest `app/seats.locked` job

### Why Redis?
Seat locks are temporary (5-minute TTL). Storing them in MongoDB requires:
- An atomic `findOneAndUpdate` with `$exists: false` check
- A separate Inngest delayed job to auto-unlock after 5 min if no booking is made

Redis solves both with a single `SET NX EX` command — if the key exists the
lock fails immediately; if no booking is made the key expires automatically.

### Key pattern
```
seat:{showId}:{seatId}
Value: userId
TTL:   300 s (5 minutes)
```

### Flow

```
LOCK SEAT
  redis.SET seat:showId:A1  userId  NX EX 300
  ├── NX succeeds → seat locked ✅
  └── NX fails    → seat already taken ❌

UNLOCK SEAT  (user deselects)
  Lua script: GET key → if value == userId → DEL key  (atomic ownership check)

CREATE BOOKING
  redis.MGET seat:showId:A1 seat:showId:A2 ...
  ├── all values == userId → proceed
  └── any mismatch → "reservation expired"
  After booking created:
    ├── Show.updateOne → occupiedSeats.A1 = userId  (permanent MongoDB record)
    └── redis.DEL seat:showId:A1 seat:showId:A2 ... (release temp locks)

GET OCCUPIED SEATS
  MongoDB  → Object.keys(show.occupiedSeats)   ← permanently booked
  Redis    → KEYS seat:showId:*                ← currently being checked-out
  Return union (deduplicated)
```

### What was removed
- `inngest.send({ name: "app/seats.locked" })` call in `lockSeats` — no longer
  needed; Redis TTL is the timer.
- `releaseLockedSeats` Inngest function removed from `functions[]` export in
  `backend/inngest/index.js` — Redis TTL replaces it entirely.

---

## 2. Show Listings Cache

**Files:** `backend/controllers/showControllers.js`

### Why Redis?
`getShows` fetches **all** future shows, populates their movies, deduplicates by
movie, then filters in-memory. This is the most-hit public endpoint and the
result changes only when a new show is added.

### Key pattern
```
shows:list:{page}:{limit}:{search}:{genres}:{languages}:{dateFrom}:{dateTo}
Value: JSON stringified response
TTL:   600 s (10 minutes)
```

Every combination of query params gets its own cache entry so filtered and
paginated results are all cached independently.

### Invalidation
`addShow` calls `invalidateShowsCache()` which does:
```
redis.KEYS shows:list:*  →  redis.DEL ...keys
```
New shows appear immediately after an admin adds them.

---

## 3. Show Detail Cache

**Files:** `backend/controllers/showControllers.js`  (`getShow`)

### Why Redis?
`getShow` fetches all future show time-slots for a movie and groups them by
date. This is called every time a user opens the MovieDetail page and doesn't
change until an admin adds a new show (which busts `shows:list:*` but not
this key — it expires naturally).

### Key pattern
```
show:detail:{movieId}
Value: JSON stringified response
TTL:   600 s (10 minutes)
```

---

## 4. Upcoming Movies Cache

**Files:** `backend/controllers/upcomingControllers.js`
**Replaces:** in-memory singleton object (`upcomingCache`)

### Why Redis?
The previous in-memory cache worked for a single process but is lost on server
restart and not shared across multiple instances. Redis gives the same 1-hour
cache with persistence across restarts and shared state in multi-instance
deployments.

### Key pattern
```
upcoming:movies
Value: JSON stringified array
TTL:   3600 s (1 hour)
```

### Invalidation
`toggleNotify` (user clicks Notify Me) calls `redis.del(UPCOMING_CACHE_KEY)`
so `notifyCount` numbers update immediately instead of waiting up to an hour.

---

## 5. Admin Dashboard Cache

**Files:** `backend/controllers/adminControllers.js`

### Why Redis?
`getDashboardData` runs three parallel queries:
- `Booking.find({ isPaid: true })` — full collection scan
- `Show.find({ showDateTime: { $gte: now } }).populate("movie")`
- `User.countDocuments()`

This is called every time an admin opens the dashboard. Results change only
when a booking is paid or an unpaid booking is deleted.

### Key pattern
```
admin:dashboard
Value: JSON stringified response
TTL:   300 s (5 minutes)
```

### Event-driven invalidation (on top of TTL)
| Event | File | Action |
|---|---|---|
| Payment succeeds (Stripe webhook) | `controllers/stripeWebhooks.js` | `redis.del("admin:dashboard")` |
| Unpaid booking deleted after 10 min | `inngest/index.js` — `releaseSeatsAndDeleteBooking` | `redis.del("admin:dashboard")` |

---

## Complete key inventory

| Key | Type | TTL | Set by | Deleted by |
|---|---|---|---|---|
| `seat:{showId}:{seatId}` | String | 300 s | `lockSeats` | `unlockSeats`, `createBooking`, auto-expire |
| `shows:list:*` | String | 600 s | `getShows` | `addShow` (wildcard flush) |
| `show:detail:{movieId}` | String | 600 s | `getShow` | auto-expire |
| `upcoming:movies` | String | 3600 s | `fetchUpcoming` | `toggleNotify`, auto-expire |
| `admin:dashboard` | String | 300 s | `getDashboardData` | Stripe webhook, Inngest payment check, auto-expire |

---

## Local development

Install Redis on Windows via WSL or Docker:

```bash
# Docker (recommended)
docker run -d -p 6379:6379 --name redis redis:alpine

# WSL
sudo apt install redis-server
sudo service redis-server start
```

Verify connection:
```bash
redis-cli ping   # → PONG
```

---

## Production

Set `REDIS_URL` to your managed Redis instance URL in your hosting environment
(e.g. Render, Railway, Upstash, Redis Cloud). Use a `rediss://` (TLS) URL in
production.

For Vercel (frontend) + separate backend host: set `REDIS_URL` only on the
backend service — the frontend never talks to Redis directly.
