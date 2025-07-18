import React from "react";
import { assets } from "../assets/assets";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const featuredMovies = [
    {
      id: 1,
      title: "Guardians of the Galaxy",
      subtitle: "Vol. 3",
      genre: "Action | Adventure | Sci-Fi",
      year: "2023",
      duration: "2h 30m",
      description:
        "In a post-apocalyptic world where cities ride on wheels and consume each other to survive, two people meet in London and try to stop a conspiracy.",
    },
  ];

  return (
    <section className="relative h-screen overflow-hidden">
      <div className="relative h-full pt-16">
        {featuredMovies.map((movie) => (
          <div key={movie.id} className={`absolute inset-0 `}>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImage})`,
              }}
            >
              <div className="absolute inset-0"></div>
            </div>

            <div className="relative bg-black/20 z-10 flex items-center h-full px-6">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  {/* Movie Badge */}
                  <div className="inline-block">
                    <img
                      src={assets.marvelLogo}
                      alt="marvellogo"
                      className="max-h-11 lg:h-11 mt-20"
                      loading="lazy"
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <h2 className="text-5xl lg:text-7xl font-bold leading-tight">
                      {movie.title}
                    </h2>
                    {movie.subtitle && (
                      <h3 className="text-3xl lg:text-4xl font-bold text-gray-300">
                        {movie.subtitle}
                      </h3>
                    )}
                  </div>

                  {/* Movie Info */}
                  <div className="flex items-center space-x-6 text-gray-300">
                    <span className="text-lg">{movie.genre}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-5 h-5" />
                      <span>{movie.year}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-5 h-5" />
                      <span>{movie.duration}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
                    {movie.description}
                  </p>

                  {/* Enhanced CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        navigate("/movies");
                        scrollTo(0, 0);
                      }}
                      className="group flex items-center max-w-50 md:max-w-2xl gap-2 mt-1 px-6 py-2 text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 ease-out cursor-pointer"
                    >
                      <span className="group-hover:-translate-x-1 transition-transform duration-200">
                        Explore Movies
                      </span>
                      <span className="inline-block transition-all duration-500 ease-in group-hover:translate-x-200 group-hover:opacity-0">
                        <ArrowRight className="w-5 h-5 " />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
