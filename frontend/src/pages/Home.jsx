import React, { Suspense, lazy } from "react";
import HeroSection from "../components/HeroSection.jsx";

// Lazy load non-critical sections that are below the fold to save main-thread work on initial load
const FeaturedSection = lazy(() => import("../components/FeaturedSection.jsx"));
const TrailerSection = lazy(() => import("../components/TrailerSection.jsx"));
const RecommendedForYou = lazy(
  () => import("@/components/RecommendedForYou.jsx"),
);

import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      {/* Hero Section - Keep static for LCP */}
      <HeroSection />

      {/* Below the fold sections - Defer to free up main thread */}
      <Suspense
        fallback={<div className="h-96 w-full animate-pulse bg-gray-900/20" />}
      >
        <FeaturedSection />
        <RecommendedForYou />

        <div className="flex justify-center mt-20">
          <button
            onClick={() => {
              navigate("/movies");
            }}
            className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-bold text-white shadow-xl cursor-pointer"
          >
            Show More
          </button>
        </div>

        <TrailerSection />
      </Suspense>
    </>
  );
};

export default Home;
