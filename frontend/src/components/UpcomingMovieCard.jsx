import {
  BookOpen,
  Calendar,
  Flame,
  Heart,
  Play,
  Share2,
  Star,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import Countdown from "./Countdown";
import NotifyButton from "./NotifyButton";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const UpcomingMovieCard = ({ movie, notify, onNotify }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      {/* Movie Poster */}
      <div className="relative overflow-hidden">
        <img
          src={TMDB_IMG + movie.posterPath}
          alt={movie.title}
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>

        {/* Popular Badge */}
        {movie.popularity > 100 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
            <Flame className="w-3 h-3 mr-1" />
            Hot
          </div>
        )}

        {/* Rating Badge */}
        {movie.voteAverage && (
          <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm font-semibold flex items-center">
            <Star className="w-3 h-3 text-yellow-400 mr-1" />
            {movie.voteAverage.toFixed(1)}
          </div>
        )}

        {/* Play Button Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-red-500/20 backdrop-blur-sm rounded-full p-4 border border-red-500/30">
            <Play className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>
      {/* Movie Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors duration-300 line-clamp-2">
          {movie.title}
        </h3>

        {/* Release Date */}
        <div className="flex items-center text-gray-400 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {new Date(movie.releaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Countdown */}
        <div className="mb-6">
          <Countdown releaseDate={movie.releaseDate} />
        </div>

        {/* Notify Button */}
        <NotifyButton
          tmdbId={movie.tmdbId}
          isNotified={notify[movie.tmdbId]}
          onNotify={onNotify}
          notifyCount={movie.notifyCount}
        />

        {/* Notify Count */}
        {movie.notifyCount > 0 && (
          <div className="mt-4 flex items-center justify-center text-yellow-400 text-sm">
            <Users className="w-4 h-4 mr-2" />
            <span>{movie.notifyCount.toLocaleString()} users want this!</span>
          </div>
        )}

        {/* Additional Actions */}
        <div className="mt-4 flex items-center justify-between text-gray-400">
          <button className="flex items-center hover:text-red-400 transition-colors duration-300">
            <Heart className="w-4 h-4 mr-1" />
            <span className="text-xs">Wishlist</span>
          </button>
          <button className="flex items-center hover:text-red-400 transition-colors duration-300">
            <Share2 className="w-4 h-4 mr-1" />
            <span className="text-xs">Share</span>
          </button>
          <button className="flex items-center hover:text-red-400 transition-colors duration-300">
            <BookOpen className="w-4 h-4 mr-1" />
            <span className="text-xs">Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingMovieCard;
