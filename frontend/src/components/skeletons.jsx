// Shared pulse atom
const s = "bg-gray-700/60 animate-pulse rounded";

// ─── Atoms ────────────────────────────────────────────────────────────────────

export const MovieCardSkeleton = () => (
  <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl w-66 shrink-0">
    <div className={`${s} h-52 w-full rounded-lg`} />
    <div className={`${s} h-4 w-3/4 mt-3`} />
    <div className={`${s} h-3 w-1/2 mt-2`} />
    <div className="flex items-center justify-between mt-4 pb-3">
      <div className={`${s} h-7 w-24 rounded-full`} />
      <div className={`${s} h-4 w-10`} />
    </div>
  </div>
);

const CastCirclesSkeleton = ({ count = 10 }) => (
  <div className="flex items-center gap-4 mt-8 pb-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-2">
        <div className={`${s} h-20 w-20 rounded-full`} />
        <div className={`${s} h-3 w-14`} />
      </div>
    ))}
  </div>
);

// ─── Public pages ─────────────────────────────────────────────────────────────

/** Home — hero + now-showing strip */
export const HomeSkeleton = () => (
  <div>
    {/* Hero */}
    <div className="relative h-[80vh] w-full bg-gray-800 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-transparent" />
      <div className="absolute bottom-16 left-6 md:left-16 lg:left-24 xl:left-44 space-y-4 w-80">
        <div className={`${s} h-5 w-24`} />
        <div className={`${s} h-10 w-72`} />
        <div className={`${s} h-4 w-64`} />
        <div className={`${s} h-4 w-52`} />
        <div className="flex gap-3 pt-2">
          <div className={`${s} h-10 w-32 rounded-full`} />
          <div className={`${s} h-10 w-32 rounded-full`} />
        </div>
      </div>
      {/* Thumbnail strip */}
      <div className="absolute bottom-4 right-6 md:right-16 flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${s} h-16 w-12 rounded-md`} />
        ))}
      </div>
    </div>

    {/* Now Showing */}
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 mt-16">
      <div className="flex items-center justify-between mb-8">
        <div className={`${s} h-4 w-28`} />
        <div className={`${s} h-4 w-14`} />
      </div>
      <div className="flex flex-wrap gap-8 max-sm:justify-center">
        {[...Array(4)].map((_, i) => <MovieCardSkeleton key={i} />)}
      </div>
    </div>
  </div>
);

/** Movies — filter bar + 16-card grid */
export const MoviesSkeleton = () => (
  <div className="my-20 px-6 md:px-16 lg:px-40 xl:px-44 min-h-[80vh]">
    {/* Header + search */}
    <div className="mb-8 space-y-4">
      <div className={`${s} h-8 w-44`} />
      <div className={`${s} h-10 w-72 rounded-md`} />
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${s} h-9 w-24 rounded-md`} />
        ))}
      </div>
    </div>
    <div className={`${s} h-4 w-40 mb-6`} />
    {/* Card grid */}
    <div className="flex flex-col items-center md:flex-row flex-wrap gap-8">
      {[...Array(8)].map((_, i) => <MovieCardSkeleton key={i} />)}
    </div>
  </div>
);

/** MovieDetail — poster + info + cast + crew + date select + suggestions */
export const MovieDetailSkeleton = () => (
  <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
    {/* Top: poster + info */}
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      <div className={`${s} max-md:mx-auto rounded-xl h-104 w-70`} />
      <div className="flex flex-col gap-4 flex-1">
        <div className={`${s} h-4 w-20`} />
        <div className={`${s} h-10 w-80`} />
        <div className={`${s} h-5 w-32`} />
        <div className={`${s} h-4 w-full`} />
        <div className={`${s} h-4 w-5/6`} />
        <div className={`${s} h-4 w-4/6`} />
        <div className={`${s} h-5 w-56 mt-2`} />
        <div className="flex gap-3 mt-4">
          <div className={`${s} h-10 w-36 rounded-md`} />
          <div className={`${s} h-10 w-28 rounded-md`} />
          <div className={`${s} h-10 w-10 rounded-full`} />
        </div>
      </div>
    </div>

    {/* Cast */}
    <div className={`${s} h-4 w-36 mt-10`} />
    <CastCirclesSkeleton count={10} />

    {/* Crew */}
    <div className={`${s} h-4 w-36 mt-6`} />
    <CastCirclesSkeleton count={10} />

    {/* Date Select placeholder */}
    <div className="mt-14 space-y-4">
      <div className={`${s} h-6 w-40`} />
      <div className="flex gap-3 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${s} h-10 w-24 rounded-md`} />
        ))}
      </div>
    </div>

    {/* You May Also Like */}
    <div className={`${s} h-5 w-44 mt-20 mb-8`} />
    <div className="flex flex-wrap max-sm:justify-center gap-8">
      {[...Array(4)].map((_, i) => <MovieCardSkeleton key={i} />)}
    </div>
    <div className="flex justify-center mt-20 mb-10">
      <div className={`${s} h-10 w-32 rounded-md`} />
    </div>
  </div>
);

/** SeatLayout — sticky timings sidebar + seat grid */
export const SeatLayoutSkeleton = () => (
  <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50 gap-8">
    {/* Timings sidebar */}
    <div className="w-60 bg-gray-800/60 rounded-lg py-10 px-6 space-y-3 h-max">
      <div className={`${s} h-5 w-36 mb-4`} />
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`${s} h-9 w-40 rounded-md`} />
      ))}
    </div>

    {/* Seat area */}
    <div className="flex-1 flex flex-col items-center gap-4">
      <div className={`${s} h-6 w-40`} />
      {/* Screen bar */}
      <div className={`${s} h-3 w-80 rounded-full mt-2`} />
      <div className={`${s} h-4 w-24 mt-1`} />
      {/* Seat rows */}
      <div className="mt-8 space-y-3 w-full max-w-md">
        {[...Array(10)].map((_, r) => (
          <div key={r} className="flex justify-center gap-2 flex-wrap">
            {[...Array(9)].map((_, c) => (
              <div key={c} className={`${s} h-8 w-8 rounded`} />
            ))}
          </div>
        ))}
      </div>
      <div className={`${s} h-10 w-48 rounded-full mt-10`} />
    </div>
  </div>
);

/** MyBookings — title + booking card rows */
export const MyBookingsSkeleton = () => (
  <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
    <div className={`${s} h-5 w-32 mb-6`} />
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="flex flex-col md:flex-row justify-between bg-gray-800/40 border border-gray-700/40 mt-4 p-2 rounded-lg"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className={`${s} md:w-45 h-28 rounded`} />
          <div className="flex flex-col gap-2 p-2 justify-center">
            <div className={`${s} h-5 w-40`} />
            <div className={`${s} h-3 w-24`} />
            <div className={`${s} h-3 w-32 mt-2`} />
          </div>
        </div>
        <div className="flex flex-col gap-3 p-4 md:items-end justify-between">
          <div className={`${s} h-6 w-20`} />
          <div className="space-y-2">
            <div className={`${s} h-3 w-32`} />
            <div className={`${s} h-3 w-28`} />
            <div className={`${s} h-8 w-28 rounded-full mt-2`} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/** Favourite — title + card grid */
export const FavouriteSkeleton = () => (
  <div className="my-40 px-6 md:px-16 lg:px-40 xl:px-44 min-h-[80vh]">
    <div className={`${s} h-5 w-44 mb-8`} />
    <div className="flex flex-wrap gap-8">
      {[...Array(6)].map((_, i) => <MovieCardSkeleton key={i} />)}
    </div>
  </div>
);

/** Upcoming — hero + filter tabs + 4-col movie grid */
export const UpcomingSkeleton = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
        <div className={`${s} h-20 w-20 rounded-2xl`} />
        <div className={`${s} h-12 w-80`} />
        <div className={`${s} h-5 w-[500px] max-w-full`} />
        <div className={`${s} h-4 w-96 max-w-full`} />
        <div className="flex gap-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${s} h-10 w-32 rounded-full`} />
          ))}
        </div>
      </div>
    </section>

    {/* Filter tabs */}
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex justify-center">
        <div className="flex gap-2 bg-gray-900/50 rounded-2xl p-2 border border-gray-800">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${s} h-11 w-32 rounded-xl`} />
          ))}
        </div>
      </div>
    </section>

    {/* Grid */}
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-2xl overflow-hidden">
            <div className={`${s} h-64 w-full rounded-none`} />
            <div className="p-4 space-y-2">
              <div className={`${s} h-5 w-3/4`} />
              <div className={`${s} h-3 w-1/2`} />
              <div className={`${s} h-9 w-full rounded-full mt-3`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

/** AboutUs — text content sections */
export const AboutUsSkeleton = () => (
  <div className="min-h-screen px-6 md:px-16 lg:px-40 py-20 space-y-16">
    {/* Hero text */}
    <div className="flex flex-col items-center gap-4 text-center">
      <div className={`${s} h-4 w-24 rounded-full`} />
      <div className={`${s} h-12 w-80`} />
      <div className={`${s} h-4 w-[500px] max-w-full`} />
      <div className={`${s} h-4 w-96 max-w-full`} />
    </div>

    {/* Stat cards row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-800/60 rounded-2xl p-6 space-y-3">
          <div className={`${s} h-8 w-8 rounded-full`} />
          <div className={`${s} h-7 w-16`} />
          <div className={`${s} h-3 w-20`} />
        </div>
      ))}
    </div>

    {/* Feature blocks */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-800/40 rounded-2xl p-6 space-y-3">
          <div className={`${s} h-10 w-10 rounded-xl`} />
          <div className={`${s} h-5 w-32`} />
          <div className={`${s} h-3 w-full`} />
          <div className={`${s} h-3 w-5/6`} />
        </div>
      ))}
    </div>

    {/* Contact section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className={`${s} h-7 w-44`} />
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${s} h-4 w-full`} />
        ))}
      </div>
      <div className="space-y-3">
        <div className={`${s} h-10 w-full rounded-md`} />
        <div className={`${s} h-10 w-full rounded-md`} />
        <div className={`${s} h-28 w-full rounded-md`} />
        <div className={`${s} h-10 w-32 rounded-md`} />
      </div>
    </div>
  </div>
);

// ─── Admin ────────────────────────────────────────────────────────────────────

/** AdminContentSkeleton — stat cards + active-shows table (renders inside Layout's Outlet) */
export const AdminContentSkeleton = () => (
  <div className="space-y-8">
    {/* Stat cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-800/60 rounded-xl p-5 space-y-3">
          <div className={`${s} h-8 w-8 rounded-full`} />
          <div className={`${s} h-7 w-20`} />
          <div className={`${s} h-3 w-28`} />
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="bg-gray-800/40 rounded-xl overflow-hidden">
      <div className={`${s} h-10 w-full rounded-none`} />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-t border-gray-700/30"
        >
          <div className={`${s} h-10 w-10 rounded`} />
          <div className={`${s} h-4 w-32`} />
          <div className={`${s} h-4 w-24 ml-auto`} />
          <div className={`${s} h-4 w-20`} />
        </div>
      ))}
    </div>
  </div>
);
