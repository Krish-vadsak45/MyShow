import React from "react";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";
import MovieFilter from "../components/MovieFilter";

const Movies = () => {
  const { shows } = useAppContext();

  return shows.length > 0 ? (
    <div className="relative my-20 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <MovieFilter />
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="150px" right="0px" />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">No Movies Available</h1>
    </div>
  );
};

export default Movies;
