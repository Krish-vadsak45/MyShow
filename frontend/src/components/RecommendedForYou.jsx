import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import MovieCard from "./MovieCard";
import BlurCircle from "./BlurCircle";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecommendedForYou = () => {
  const { recommendationShows } = useAppContext();
  const navigate = useNavigate();

  if (!recommendationShows.length) return null;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      <div className="relative flex items-center justify-between pt-10 pb-10">
        <BlurCircle top="0" right="-80px" />
        <p className="text-gray-300 font-medium text-lg">Recommended for You</p>
      </div>

      <div className="flex flex-wrap gap-8 max-sm:justify-center">
        {recommendationShows.map((show) => (
          <MovieCard key={show._id} movie={show} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedForYou;
