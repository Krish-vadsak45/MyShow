# MyShow — Full-Stack Movie & Show Booking Platform

![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=node.js&logoColor=white)
![React 18](https://img.shields.io/badge/React_18-Frontend-61DAFB?logo=react&logoColor=black)
![Redis](https://img.shields.io/badge/Redis-Cache_%26_Locks-DC382D?logo=redis&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Auth-FF4747?logo=clerk&logoColor=white)
![TMDB](https://img.shields.io/badge/TMDB-Movie_Data-01B4E4?logo=themoviedatabase&logoColor=white)
![Pino](https://img.shields.io/badge/Pino-Structured_Logging-green)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-yellow)

**Browse. Book. Watch. — Production-ready movie ticketing at full scale.**

**[Live Demo →](https://myshow-eight.vercel.app)**

---

## The Problem It Solves

Online movie booking is broken in three key ways — MyShow fixes all of them:

| Problem | MyShow Solution |
|---|---|
| **Double-bookings & race conditions** | Atomic Redis `SET NX EX` seat locks — two users can never book the same seat |
| **Token theft via XSS** | Auth tokens stored only in HTTP-only cookies — JavaScript can never read them |
| **Cold, generic recommendations** | Personalized engine built from each user's bookings, favourites, and search history |
| **Stale data under load** | Multi-layer Redis cache with event-driven invalidation — no stale shows or dashboards |
| **Unprotected endpoints** | Per-route Redis-backed rate limiting (global / auth / booking tiers) |
| **No visibility into errors** | Pino structured logging + global Express error handler in every environment |

---

## What's New (Recent Releases)

- **Redis Rate Limiter** — enterprise-grade, per-IP, per-route limits using Redis counters (global 200/15 min, auth 20/15 min, booking 15/5 min)
- **Pino Structured Logging** — JSON logs in production, pretty-printed in development; every unhandled error is captured with method + path context
- **Response Compression** — `compression` middleware shaved payload sizes across all API responses
- **About Us page** — contact form, report form, stats section, and team information
- **ScrollToTop** — automatic scroll reset on every route change
- **Google Calendar integration** — add booked shows directly to Google Calendar
- **Movie Ticket UI** — downloadable/shareable ticket component after booking confirmation
- **Upcoming movie notifications** — users subscribe; admin triggers bulk email when show goes live
- **`chatControllers.js` removed** — chat consolidated under `agent.controller.js` (LangChain + Groq)
- **`/health` endpoint** — uptime monitoring and load-balancer probe ready

---

## Feature Overview

### Users

- Secure sign-in via Clerk — token lives only in an HTTP-only cookie (XSS-proof)
- Browse, search, and filter movies by genre, language, and release date
- Personalized AI recommendations based on booking history, favourites, and searches
- Real-time seat selection — Redis-locked seats disappear for other users instantly
- Stripe Checkout payment with booking confirmation email
- Add show to Google Calendar after booking
- Download/share a stylised movie ticket after confirmation
- Favourite movies for quick access and smarter recommendations
- Upcoming movies with countdown timers and "Notify Me" alerts
- View full booking history in My Bookings
- AI chatbot (LangChain + Groq) for movie discovery and booking help
- Report issues or contact support from the About Us page
- Skeleton loaders on every page — no blank-screen flash during data fetch

### Admin

- Dashboard: total bookings, revenue, active shows, user count — Redis-cached (5 min, event-busted on every payment)
- Add shows — auto-fetches movie details, cast, and trailers from TMDB; busts cache instantly
- View all shows, bookings, payment status, and occupied seats
- Analytics charts — revenue over time, genre breakdown, occupancy rates
- Upcoming movie notifications: see demand (`notifyCount`), trigger bulk emails to subscribers

### Backend

- Cookie-based JWT auth — `verifyToken` with 3-minute clock-skew tolerance
- Redis seat locking: atomic `SET NX EX` prevents double-booking without any DB write race
- Redis caching: show listings, show details, upcoming movies, admin dashboard
- Redis rate limiting: global / auth / booking tiers with per-IP counters
- Pino HTTP logger + global error handler
- Response compression on all routes
- Inngest background jobs: payment cleanup, confirmation emails, show reminders, Clerk sync
- Stripe webhook sets `isPaid` and immediately invalidates dashboard cache
- TMDB API for movie data, cast, trailers, and now-playing list
- Brevo SMTP for transactional and notification emails
- `/health` endpoint for uptime monitoring

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Clerk React, Recharts, Axios, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Clerk Express, cookie-parser, compression |
| **Logging** | Pino, pino-http, pino-pretty |
| **Cache / Locks / Rate Limits** | Redis (ioredis) |
| **Auth** | Clerk (JWT), HTTP-only cookies, custom `verifyToken` middleware |
| **Payments** | Stripe Checkout, Stripe Webhooks |
| **Background Jobs** | Inngest (serverless event-driven functions) |
| **AI / Chat** | LangChain, Groq LLM |
| **Email** | Nodemailer + Brevo SMTP |
| **Movie Data** | TMDB API v3 |
| **Infrastructure** | Docker, Docker Compose, Nginx (frontend container) |

---

## Architecture

```
Browser
  │
  ├── Vite dev proxy (/api → localhost:3000)   ← development
  └── Direct HTTPS to backend                  ← production
          │
          ▼
    Express (port 3000)
          │
          ├── compression()          gzip all responses
          ├── pinoHttp()             structured request logging
          ├── cookieParser()         reads HTTP-only cookies
          ├── clerkMiddleware()      attaches Clerk session to req
          │
          ├── rateLimiter("global",  200, 15 min)   all /api/*
          ├── rateLimiter("auth",     20, 15 min)   /api/auth
          ├── rateLimiter("booking",  15,  5 min)   /api/booking/create
          │
          ├── /health               uptime probe
          ├── /api/auth             set / clear __auth_token cookie
          ├── /api/show             listings + detail  (Redis cache)
          ├── /api/booking          lock / unlock / create  (Redis NX)
          ├── /api/user             bookings, favourites
          ├── /api/admin            dashboard + analytics  (Redis cache)
          ├── /api/upcoming         upcoming movies  (Redis cache, 1 hr)
          ├── /api/recommendation   personalized picks
          ├── /api/agent            LangChain + Groq AI chatbot
          ├── /api/stripe           Stripe webhook (raw body)
          └── /api/inngest          background job handler
                    │
                    ├── MongoDB (Mongoose)   persistent store
                    └── Redis  (ioredis)     seat locks + cache + rate limits
```

---

## Cookie-Based Authentication

All authenticated requests travel via an HTTP-only cookie — never an `Authorization` header.

**Why:** HTTP-only cookies are invisible to JavaScript. An XSS attack that injects malicious scripts cannot read `__auth_token`. Tokens in `localStorage` or memory can be stolen; this one cannot.

**Flow:**

1. User signs in via Clerk on the frontend
2. Frontend calls `POST /api/auth/session` with the Clerk JWT
3. Backend sets `__auth_token` as an HTTP-only, `Secure`, `SameSite` cookie
4. Every subsequent API request includes the cookie automatically — no manual headers
5. `auth.js` middleware reads the cookie and calls `verifyToken` with a 3-minute clock-skew tolerance
6. On sign-out, `POST /api/auth/logout` clears the cookie server-side

| Cookie Setting | Development | Production |
| --- | --- | --- |
| `httpOnly` | `true` | `true` |
| `secure` | `false` | `true` (HTTPS only) |
| `sameSite` | `lax` (Vite proxy = same-origin) | `none` (cross-origin HTTPS) |

**Token refresh:** The frontend refreshes the cookie every 50 seconds (Clerk JWTs expire after 60 s).

**Session-ready guarantee:** `AppContext` marks `user` as ready only _after_ the cookie is confirmed — no component fires an authenticated request before the cookie exists.

---

## Redis Usage

See [REDIS.md](./REDIS.md) for the full deep-dive.

| Key Pattern | Purpose | TTL | Invalidated by |
| --- | --- | --- | --- |
| `seat:{showId}:{seatId}` | Atomic seat lock during checkout | 5 min | `unlockSeats`, `createBooking`, auto-expire |
| `shows:list:*` | Paginated + filtered show listings | 10 min | `addShow` (wildcard flush) |
| `show:detail:{movieId}` | Show date/time slots | 10 min | auto-expire |
| `upcoming:movies` | TMDB upcoming movies | 1 hour | `toggleNotify`, auto-expire |
| `admin:dashboard` | Aggregated dashboard metrics | 5 min | Stripe webhook, Inngest payment check |
| `ratelimit:{prefix}:{ip}` | Per-route, per-IP request counter | window TTL | auto-expire |

---

## Rate Limiting

Three Redis-backed rate limit tiers protect every route:

| Tier | Route | Limit | Window |
| --- | --- | --- | --- |
| `global` | `/api/*` | 200 requests | 15 min |
| `auth` | `/api/auth` | 20 requests | 15 min |
| `booking` | `/api/booking/create` | 15 requests | 5 min |

When Redis is unavailable the middleware **fails open** (passes the request) to avoid taking down the app. All rate-limit violations are logged via Pino with IP and tier context.

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or managed)
- Clerk account (free tier)
- Stripe account (test mode)
- TMDB API v4 access token
- Brevo account (SMTP — free tier)
- Groq API key

### Redis (local)

```bash
# Docker (recommended)
docker run -d -p 6379:6379 --name redis redis:alpine

# WSL / Ubuntu
sudo apt install redis-server && sudo service redis-server start

# Verify
redis-cli ping   # → PONG
```

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/myshow

REDIS_URL=redis://localhost:6379

CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

TMDB_API_KEY=<tmdb_v4_bearer_token>

INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

SENDER_EMAIL=you@example.com
SMTP_USER=<brevo_smtp_user>
SMTP_PASS=<brevo_smtp_password>

GROQ_API_KEY=...
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CURRENCY=$
VITE_BASE_URL=http://localhost:3000
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
```

> In development, Vite proxies all `/api` requests to `localhost:3000`, making them same-origin so cookies work without any extra configuration.

```bash
npm run dev   # → http://localhost:5173
```

---

## Docker

```bash
# From project root
docker-compose up --build
```

| Service | Host port |
|---|---|
| Frontend (Nginx) | 5173 |
| Backend (Express) | 4000 |
| MongoDB | 27017 |

To add Redis to the Docker stack, append to `docker-compose.yml`:

```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
  networks:
    - app-network
```

Then set `REDIS_URL=redis://redis:6379` in the backend environment block.

---

## API Reference

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Uptime probe |
| `POST` | `/api/auth/session` | — | Set HTTP-only session cookie |
| `POST` | `/api/auth/logout` | — | Clear session cookie |
| `GET` | `/api/show/all` | — | Paginated + filtered listings (cached) |
| `GET` | `/api/show/:movieId` | — | Show detail with time slots (cached) |
| `GET` | `/api/show/now-playing` | Admin | TMDB now-playing list |
| `POST` | `/api/show/add` | Admin | Add show + bust cache |
| `POST` | `/api/show/notify-count` | Admin | Notify counts for movie list |
| `POST` | `/api/booking/lock-seats` | User | Redis NX seat lock |
| `POST` | `/api/booking/unlock-seats` | User | Release seat lock (atomic Lua) |
| `POST` | `/api/booking/create` | User | Create booking + Stripe session |
| `GET` | `/api/booking/seats/:showId` | — | Occupied seats (Redis + MongoDB union) |
| `GET` | `/api/user/bookings` | User | User booking history |
| `POST` | `/api/user/update-favourite` | User | Toggle favourite movie |
| `GET` | `/api/user/favourites` | User | List favourite movies |
| `GET` | `/api/admin/is-admin` | Admin | Verify admin role |
| `GET` | `/api/admin/dashboard` | Admin | Metrics (cached 5 min) |
| `GET` | `/api/admin/all-shows` | Admin | All active shows |
| `GET` | `/api/admin/all-bookings` | Admin | All bookings |
| `GET` | `/api/admin/analytics` | Admin | Revenue + occupancy charts |
| `GET` | `/api/admin/notify-movies` | Admin | Movies with pending notify users |
| `GET` | `/api/upcoming` | — | Upcoming movies (TMDB, cached 1 hr) |
| `POST` | `/api/upcoming/notify` | User | Toggle movie notification |
| `GET` | `/api/upcoming/user/notified` | User | User notification list |
| `GET` | `/api/recommendation/personalized` | User | Personalised recommendations |
| `POST` | `/api/agent` | User | AI chatbot (LangChain + Groq) |
| `POST` | `/api/stripe` | — | Stripe webhook (raw body) |

---

## Inngest Background Jobs

| Function | Trigger | Action |
| --- | --- | --- |
| `sync-user-from-clerk` | `clerk/user.created` | Creates User document in MongoDB |
| `delete-user-with-clerk` | `clerk/user.deleted` | Deletes User document |
| `update-user-from-clerk` | `clerk/user.updated` | Updates User document |
| `release-seats-delete-booking` | `app/checkpayment` (+10 min delay) | Deletes unpaid booking, restores `occupiedSeats`, busts dashboard cache |
| `send-booking-confirmation-email` | `app/show.booked` | Sends confirmation email via SMTP |
| `send-show-reminders` | Cron `0 */8 * * *` | Emails users 8 hours before their show |
| `send-new-show-notifications` | `app/show.added` | Emails all subscribed users when a new show goes live |

> Redis TTL handles seat auto-unlock — no `releaseLockedSeats` Inngest job needed.

---

## Folder Structure

```
myshow/
├── backend/
│   ├── config/
│   │   ├── db.js                  MongoDB connection
│   │   ├── redis.js               ioredis client (lazyConnect, retry)
│   │   ├── logger.js              Pino logger (pretty dev / JSON prod)
│   │   └── nodeMailer.js          Brevo SMTP transport
│   ├── controllers/
│   │   ├── authController.js      Set / clear __auth_token cookie
│   │   ├── adminControllers.js    Dashboard, shows, bookings (Redis cache)
│   │   ├── adminAnalytics.js      Revenue + occupancy charts
│   │   ├── bookingControllers.js  Lock / unlock / create (Redis NX)
│   │   ├── showControllers.js     Show CRUD + TMDB fetch (Redis cache)
│   │   ├── upcomingControllers.js Upcoming movies (Redis cache)
│   │   ├── userControllers.js     Bookings, favourites
│   │   ├── stripeWebhooks.js      isPaid + bust dashboard cache
│   │   ├── recommendationController.js  Personalized picks
│   │   └── agent.controller.js    LangChain + Groq AI chatbot
│   ├── inngest/
│   │   └── index.js               Background jobs
│   ├── middleware/
│   │   ├── auth.js                verifyToken from __auth_token cookie
│   │   └── rateLimiter.js         Redis-backed per-IP rate limiting
│   ├── models/
│   │   ├── booking.model.js
│   │   ├── movie.model.js
│   │   ├── show.model.js
│   │   ├── upcomingMovie.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── agentRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── showRoutes.js
│   │   ├── upcomingRoutes.js
│   │   └── userRoutes.js
│   ├── Dockerfile
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── admin/             Dashboard, Sidebar, Navbar, Analytics UI
│       │   ├── ui/                shadcn/ui components
│       │   ├── ChatBot.jsx        AI chatbot (cookie auth)
│       │   ├── MovieTicket.jsx    Downloadable ticket component
│       │   ├── GoogleCalendar.jsx Add show to Google Calendar
│       │   ├── ScrollToTop.jsx    Auto scroll reset on route change
│       │   ├── ContactForm.jsx    Contact / support form
│       │   ├── ReportForm.jsx     Issue report form
│       │   └── skeletons.jsx      Per-route skeleton loaders
│       ├── context/
│       │   └── AppContext.jsx     Cookie session sync, global axios config
│       ├── pages/
│       │   ├── admin/             Dashboard, AddShows, Analytics, etc.
│       │   ├── Home.jsx
│       │   ├── Movies.jsx
│       │   ├── MovieDetail.jsx
│       │   ├── SeatLayout.jsx
│       │   ├── MyBookings.jsx
│       │   ├── Upcoming.jsx
│       │   ├── Favourite.jsx
│       │   └── AboutUs.jsx
│       └── App.jsx
├── docker-compose.yml
├── REDIS.md                       Redis integration deep-dive
└── README.md
```

---

## Environment Variables Reference

| Variable | Service | Description |
| --- | --- | --- |
| `PORT` | Backend | Express server port |
| `NODE_ENV` | Backend | `development` or `production` |
| `LOG_LEVEL` | Backend | Pino log level (`info`, `debug`, `warn`) |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `REDIS_URL` | Backend | Redis connection URL |
| `CLERK_PUBLISHABLE_KEY` | Backend | Clerk public key |
| `CLERK_SECRET_KEY` | Backend | Clerk secret (never expose to frontend) |
| `STRIPE_PUBLISHABLE_KEY` | Backend | Stripe public key |
| `STRIPE_SECRET_KEY` | Backend | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Backend | Stripe webhook signing secret |
| `TMDB_API_KEY` | Backend | TMDB v4 bearer token |
| `INNGEST_EVENT_KEY` | Backend | Inngest event key |
| `INNGEST_SIGNING_KEY` | Backend | Inngest signing key |
| `SENDER_EMAIL` | Backend | From address for emails |
| `SMTP_USER` | Backend | Brevo SMTP username |
| `SMTP_PASS` | Backend | Brevo SMTP password |
| `GROQ_API_KEY` | Backend | Groq LLM API key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend | Clerk public key for Clerk React |
| `VITE_CURRENCY` | Frontend | Currency symbol (e.g. `$`) |
| `VITE_BASE_URL` | Frontend | Backend base URL |
| `VITE_TMDB_IMAGE_BASE_URL` | Frontend | TMDB image CDN base URL |

---

## License

ISC © [krish-vadsak45](https://github.com/krish-vadsak45)
