import HeroSection from "../components/HeroSection.jsx";
import FeaturedSection from "../components/FeaturedSection.jsx";
import TrailerSection from "../components/TrailerSection.jsx";
import RecommendedForYou from "@/components/RecommendedForYou.jsx";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      {/* Featured Section */}
      <FeaturedSection />
      <RecommendedForYou />
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show More
        </button>
      </div>
      {/* Trailer Section */}
      <TrailerSection />
    </>
  );
};

export default Home;
