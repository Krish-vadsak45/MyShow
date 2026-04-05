import React, { useMemo } from "react";
import PropTypes from "prop-types";

// ─── Shared Pulse Atom ──────────────────────────────────────────────────────
const s = "bg-gray-700/60 animate-pulse rounded";

// ─── Atoms ────────────────────────────────────────────────────────────────────

export const MovieCardSkeleton = () => (
  <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl w-66 shrink-0 h-[360px]">
    <div className={`${s} h-52 w-full rounded-lg`} />
    <div className={`${s} h-6 w-3/4 mt-3`} />
    <div className={`${s} h-4 w-1/2 mt-2`} />
    <div className="flex items-center justify-between mt-4 pb-3">
      <div className={`${s} h-8 w-24 rounded-full`} />
      <div className={`${s} h-5 w-10`} />
    </div>
  </div>
);

const CastCirclesSkeleton = ({ count = 8 }) => {
  const items = useMemo(
    () =>
      new Array(count).fill(null).map((_, i) => ({
        id: `cast-${i}-${Math.random()}`,
      })),
    [count],
  );
  return (
    <div className="flex items-center gap-4 mt-8 pb-4 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center gap-2 shrink-0"
        >
          <div className={`${s} h-20 w-20 rounded-full`} />
          <div className={`${s} h-3 w-14`} />
        </div>
      ))}
    </div>
  );
};

CastCirclesSkeleton.propTypes = {
  count: PropTypes.number,
};

// ─── Public Pages ─────────────────────────────────────────────────────────────

/** Home — matching HeroSection and FeaturedSection height/layout */
export const HomeSkeleton = () => {
  const items = useMemo(
    () => new Array(4).fill(null).map((_, i) => ({ id: `home-${i}` })),
    [],
  );
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section Placeholder */}
      <div className="relative h-screen w-full bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <div className="relative z-20 h-full flex items-center px-6 md:px-16 lg:px-24 xl:px-44">
          <div className="space-y-6 w-full max-w-lg">
            <div className={`${s} h-11 w-32 mt-20`} />{" "}
            {/* Marvel Logo Placeholder */}
            <div className={`${s} h-16 md:h-20 w-3/4`} /> {/* Title */}
            <div className={`${s} h-8 w-1/2`} /> {/* Subtitle */}
            <div className="flex items-center space-x-6">
              <div className={`${s} h-6 w-32`} />
              <div className={`${s} h-6 w-20`} />
              <div className={`${s} h-6 w-20`} />
            </div>
            <div className="space-y-2">
              <div className={`${s} h-4 w-full`} />
              <div className={`${s} h-4 w-full`} />
              <div className={`${s} h-4 w-2/3`} />
            </div>
            <div className={`${s} h-12 w-48 rounded-full mt-4`} />
          </div>
        </div>
      </div>

      {/* Featured Section Placeholder */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div className={`${s} h-6 w-32`} />
          <div className={`${s} h-6 w-20`} />
        </div>
        <div className="flex flex-wrap gap-8 max-sm:justify-center">
          {items.map((item) => (
            <MovieCardSkeleton key={item.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

/** Movies — matching MovieFilter layout precisely */
export const MoviesSkeleton = () => {
  const filterItems = useMemo(
    () => new Array(12).fill(null).map((_, i) => ({ id: `filter-${i}` })),
    [],
  );
  const movieItems = useMemo(
    () => new Array(8).fill(null).map((_, i) => ({ id: `movie-${i}` })),
    [],
  );
  return (
    <div className="my-20 px-6 md:px-16 lg:px-40 xl:px-44 min-h-[80vh] pt-10">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className={`${s} h-10 flex-1 max-w-md rounded-md`} />
        <div className={`${s} h-10 w-32 rounded-md`} />
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        {filterItems.map((item) => (
          <div key={item.id} className={`${s} h-6 w-20 rounded-full`} />
        ))}
      </div>

      {/* Grid */}
      <div className={`${s} h-5 w-40 mb-8`} />
      <div className="flex flex-wrap gap-8 max-sm:justify-center">
        {movieItems.map((item) => (
          <MovieCardSkeleton key={item.id} />
        ))}
      </div>
    </div>
  );
};

/** MovieDetail — Matching the layout of MovieDetail.jsx */
export const MovieDetailSkeleton = () => {
  const dateItems = useMemo(
    () => new Array(6).fill(null).map((_, i) => ({ id: `date-${i}` })),
    [],
  );
  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50 animate-in fade-in">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <div className={`${s} rounded-xl h-104 w-70 shrink-0`} />
        <div className="flex flex-col gap-4 flex-1">
          <div className={`${s} h-5 w-20`} />
          <div className={`${s} h-12 w-3/4`} />
          <div className={`${s} h-6 w-48`} />
          <div className="space-y-2 mt-4">
            <div className={`${s} h-4 w-full`} />
            <div className={`${s} h-4 w-full`} />
            <div className={`${s} h-4 w-2/3`} />
          </div>
          <div className={`${s} h-6 w-64 mt-4`} />
          <div className="flex gap-4 mt-6">
            <div className={`${s} h-12 w-40`} />
            <div className={`${s} h-12 w-40`} />
            <div className={`${s} h-12 w-12 rounded-full`} />
          </div>
        </div>
      </div>

      <div className={`${s} h-6 w-40 mt-14 mb-8`} />
      <CastCirclesSkeleton count={10} />

      <div className={`${s} h-6 w-40 mt-10 mb-8`} />
      <CastCirclesSkeleton count={10} />

      {/* DateSelect placeholder */}
      <div className="mt-14 p-6 bg-gray-800/20 rounded-xl">
        <div className={`${s} h-6 w-48 mb-6`} />
        <div className="flex gap-4 overflow-hidden">
          {dateItems.map((item) => (
            <div key={item.id} className={`${s} h-20 w-16 shrink-0`} />
          ))}
        </div>
      </div>
    </div>
  );
};

/** SeatLayout — Sidebar + Grid */
export const SeatLayoutSkeleton = () => {
  const timingItems = useMemo(
    () => new Array(6).fill(null).map((_, i) => ({ id: `timing-${i}` })),
    [],
  );
  const rows = useMemo(
    () => new Array(8).fill(null).map((_, i) => ({ id: `row-${i}` })),
    [],
  );
  const cols = useMemo(
    () => new Array(9).fill(null).map((_, i) => ({ id: `col-${i}` })),
    [],
  );
  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 pt-30 md:pt-50 gap-12 min-h-screen">
      {/* Timings Sidebar */}
      <div className="w-60 bg-gray-800/40 rounded-xl py-10 px-6 space-y-4 h-max shrink-0">
        <div className={`${s} h-6 w-40 mb-4`} />
        {timingItems.map((item) => (
          <div key={item.id} className={`${s} h-10 w-full rounded-lg`} />
        ))}
      </div>

      {/* Seat Area */}
      <div className="flex-1 flex flex-col items-center">
        <div className={`${s} h-8 w-64 mb-8`} />
        <div
          className={`${s} h-16 w-full max-w-2xl rounded-t-full opacity-20`}
        />
        <div className={`${s} h-4 w-32 mt-4 mb-12`} />

        <div className="space-y-4 w-full max-w-md">
          {rows.map((row) => (
            <div key={row.id} className="flex justify-center gap-3">
              {cols.map((col) => (
                <div
                  key={`${row.id}-${col.id}`}
                  className={`${s} h-8 w-8 rounded-sm`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className={`${s} h-12 w-56 rounded-full mt-16`} />
      </div>
    </div>
  );
};

/** MyBookings — title + booking card rows */
export const MyBookingsSkeleton = () => {
  const items = useMemo(
    () => new Array(4).fill(null).map((_, i) => ({ id: i })),
    [],
  );
  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <div className={`${s} h-5 w-32 mb-6`} />
      {items.map((item) => (
        <div
          key={item.id}
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
};

/** Favourite — title + card grid */
export const FavouriteSkeleton = () => {
  const items = useMemo(
    () => new Array(6).fill(null).map((_, i) => ({ id: i })),
    [],
  );
  return (
    <div className="my-40 px-6 md:px-16 lg:px-40 xl:px-44 min-h-[80vh]">
      <div className={`${s} h-5 w-44 mb-8`} />
      <div className="flex flex-wrap gap-8">
        {items.map((item) => (
          <MovieCardSkeleton key={item.id} />
        ))}
      </div>
    </div>
  );
};

/** Upcoming — hero + filter tabs + 4-col movie grid */
export const UpcomingSkeleton = () => {
  const heroArray = useMemo(
    () => new Array(3).fill(null).map((_, i) => ({ id: i })),
    [],
  );
  const filterArray = useMemo(
    () => new Array(3).fill(null).map((_, i) => ({ id: i })),
    [],
  );
  const gridArray = useMemo(
    () => new Array(8).fill(null).map((_, i) => ({ id: i })),
    [],
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className={`${s} h-20 w-20 rounded-2xl`} />
          <div className={`${s} h-12 w-80`} />
          <div className={`${s} h-5 w-[500px] max-w-full`} />
          <div className={`${s} h-4 w-96 max-w-full`} />
          <div className="flex gap-4 mt-4">
            {heroArray.map((item) => (
              <div key={item.id} className={`${s} h-10 w-32 rounded-full`} />
            ))}
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="flex gap-2 bg-gray-900/50 rounded-2xl p-2 border border-gray-800">
            {filterArray.map((item) => (
              <div key={item.id} className={`${s} h-11 w-32 rounded-xl`} />
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {gridArray.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-2xl overflow-hidden"
            >
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
};

/** AboutUs — text content sections */
export const AboutUsSkeleton = () => {
  const statArray = useMemo(
    () => new Array(4).fill(null).map((_, i) => ({ id: i })),
    [],
  );
  const featureArray = useMemo(
    () => new Array(3).fill(null).map((_, i) => ({ id: i })),
    [],
  );
  const contactArray = useMemo(
    () => new Array(4).fill(null).map((_, i) => ({ id: i })),
    [],
  );

  return (
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
        {statArray.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/60 rounded-2xl p-6 space-y-3"
          >
            <div className={`${s} h-8 w-8 rounded-full`} />
            <div className={`${s} h-7 w-16`} />
            <div className={`${s} h-3 w-20`} />
          </div>
        ))}
      </div>

      {/* Feature blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featureArray.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/40 rounded-2xl p-6 space-y-3"
          >
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
          {contactArray.map((item) => (
            <div key={item.id} className={`${s} h-4 w-full`} />
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
};

// ─── Admin ────────────────────────────────────────────────────────────────────

/** AdminContentSkeleton — stat cards + active-shows table (renders inside Layout's Outlet) */
export const AdminContentSkeleton = () => {
  const statItems = useMemo(
    () => new Array(4).fill(null).map((_, i) => ({ id: i })),
    [],
  );
  const tableItems = useMemo(
    () => new Array(6).fill(null).map((_, i) => ({ id: i })),
    [],
  );

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/60 rounded-xl p-5 space-y-3"
          >
            <div className={`${s} h-8 w-8 rounded-full`} />
            <div className={`${s} h-7 w-20`} />
            <div className={`${s} h-3 w-28`} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-800/40 rounded-xl overflow-hidden">
        <div className={`${s} h-10 w-full rounded-none`} />
        {tableItems.map((item) => (
          <div
            key={item.id}
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
};
