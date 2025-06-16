import React from "react";
import HeroSection from "../components/HeroSection.jsx";
import { assets } from "../assets/assets.js";
import backgroundImage from "../assets/backgroundImage.png";
import Navbar from "../components/Navbar.jsx";
import FeaturedSection from "../components/FeaturedSection.jsx";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      {/* Featured Section */}
      <FeaturedSection />
    </>
  );
};

export default Home;
