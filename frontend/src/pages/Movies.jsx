import React from "react";
import BlurCircle from "../components/BlurCircle";
import MovieFilter from "../components/MovieFilter";

const Movies = () => {
  return (
    <div className="relative my-20 mb-10 md:mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <MovieFilter />
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="150px" right="0px" />
    </div>
  );
};

export default Movies;
