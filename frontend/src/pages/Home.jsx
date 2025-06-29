import HeroSection from "../components/HeroSection.jsx";
import FeaturedSection from "../components/FeaturedSection.jsx";
import TrailerSection from "../components/TrailerSection.jsx";
import ChatBox from "@/components/ChatBox.jsx";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      {/* Featured Section */}
      <FeaturedSection />
      {/* Trailer Section */}
      <TrailerSection />
      <ChatBox />
    </>
  );
};

export default Home;
