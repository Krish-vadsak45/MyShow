import React from "react";
import {
  Film,
  Home,
  Search,
  Ticket,
  Popcorn,
  Star,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 animate-pulse">
          <Film size={80} className="text-yellow-400" />
        </div>
        <div className="absolute top-40 right-32 animate-bounce">
          <Popcorn size={60} className="text-red-400" />
        </div>
        <div className="absolute bottom-32 left-40 animate-pulse">
          <Ticket size={70} className="text-blue-400" />
        </div>
        <div className="absolute bottom-20 right-20 animate-bounce">
          <Star size={50} className="text-yellow-400" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* 404 Number */}
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 animate-pulse">
              404
            </h1>
            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6">
              <Film size={60} className="text-yellow-400 animate-spin" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Oops! This Show Has Been
            <span className="block text-red-400">Cancelled</span>
          </h2>

          <BlurCircle top="90px" right="310px" />
          {/* Description */}
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The page you're looking for seems to have gone missing from our
            theater. Don't worry though - there are plenty of other amazing
            shows to discover!
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <button
              onClick={() => navigate("/")}
              className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 cursor-pointer min-w-[200px]"
            >
              <Home size={20} />
              <span>Back to Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={() => {
                navigate("/movies");
                setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }, 100);
              }}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 cursor-pointer min-w-[200px]"
            >
              <Search size={20} />
              <span>Browse Movies</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Go back link */}
          <div className="mt-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center cursor-pointer gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform duration-300"
              />
              <span>Go back to previous page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Animated spotlight effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-yellow-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
};

export default NotFound;
