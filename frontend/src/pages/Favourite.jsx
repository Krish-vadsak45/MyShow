import React from "react";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";
import NotExist from "../components/NotExist";
import { Heart } from "lucide-react";

const Favourite = () => {
  const { favouriteMovies } = useAppContext();
  // console.log("in favourite" ,favouriteMovies);

  if (favouriteMovies.length === 0) {
    return (
      <NotExist
        title="No Favourites Yet"
        message="You haven't added any movies to your favourites yet. Start exploring and save the movies you love for easy access later!"
        buttonLabel="Explore Movies"
        redirectPath="/movies"
        icon={Heart}
      />
    );
  }

  return (
    favouriteMovies.length > 0 && (
      <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
        <BlurCircle top="150px" left="0px" />
        <BlurCircle bottom="150px" right="0px" />

        <h1 className="text-lg font-medium my-4">Your Favourite Movies</h1>
        <div className="flex flex-wrap gap-8">
          {favouriteMovies.map((movie) => (
            <MovieCard movie={movie} key={movie._id} />
          ))}
        </div>
      </div>
    )
  );
};

export default Favourite;
