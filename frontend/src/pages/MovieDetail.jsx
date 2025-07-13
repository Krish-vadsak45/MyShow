import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MovieDetail = () => {
  const {
    shows,
    axios,
    user,
    fetchFavouriteMovies,
    favouriteMovies,
    image_base_url,
    getToken,
  } = useAppContext();

  const { id } = useParams();
  // console.log(id);
  const [show, setShow] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const navigate = useNavigate();

  const getUniqueBy = (arr, key) => {
    const seen = new Set();
    return arr.filter((item) => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  };

  const getshow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      // console.log(data);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.error("Failed to fetch show:", error);
    }
  };

  const handleFavourite = async () => {
    try {
      if (!user) {
        return toast.error("Please login to proceed");
      }
      const { data } = await axios.post(
        "/api/user/update-favourite",
        {
          movieId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        await fetchFavouriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Failed to add favourite movie:", error);
    }
  };

  useEffect(() => {
    getshow();
  }, [id]);

  return show ? (
    <>
      <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
          <img
            src={image_base_url + show.movie.poster_path}
            alt=""
            className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
          />
          <div className="relative flex flex-col gap-3">
            <BlurCircle top="-100px" left="-100px" />
            <p className="text-primary">English</p>
            <h1 className="text-4xl font-semibold max-w-96 text-balance">
              {show.movie.title}
            </h1>
            <div className="flex  items-center gap-2 text-gray-500">
              <StarIcon className="w-5 h-5 text-primary fill-primary" />
              {show.movie.vote_average.toFixed(1)} User Rating
            </div>
            <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
              {show.movie.overview}
            </p>
            <p>
              {timeFormat(show.movie.runtime)} ·{" "}
              {show.movie.genres.map((genre) => genre.name).join(", ")} ·{" "}
              {show.movie.release_date.split("-")[0]}
            </p>
            <div className="flex items-center flex-wrap gap-4 mt-4">
              {show.movie.trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-7 py-3 text-sm
                bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium
            cursor-pointer active: scale-95"
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Watch Trailer
                </button>
              )}
              <a
                href="#dateSelect"
                className="px-10 py-3 text-sm bg-primary
              hover:bg-primary-dull transition rounded-md font-medium cursor-pointer
              active: scale-95"
              >
                Buy Tickets
              </a>
              <button
                className="bg-gray-700 p-2.5 rounded-full transition
              cursor-pointer active: scale-95"
              >
                <Heart
                  onClick={handleFavourite}
                  className={`w-5 h-5 ${
                    favouriteMovies.find((movie) => movie._id === id)
                      ? "fill-primary text-primary"
                      : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-10">Your Favourite Cast</p>
        <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
          <div className="flex items-center gap-4 w-max px-4">
            {getUniqueBy(
              show.movie.cast.filter((cast) => cast.profile_path),
              "id"
            )
              .slice(0, 12)
              .map((cast, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <img
                    src={image_base_url + cast.profile_path}
                    alt=""
                    className="rounded-full h-20 md:h-20 aspect-square object-cover"
                  />
                  <p className="font-medium text-xs mt-3">{cast.name}</p>
                </div>
              ))}
          </div>
        </div>
        <p className="mt-5">Your Favourite Crew</p>
        <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
          <div className="flex items-center gap-4 w-max px-4">
            {getUniqueBy(
              show.movie.crew.filter((crew) => crew.profile_path),
              "id"
            )
              .slice(0, 12)
              .map((crew, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <img
                    src={image_base_url + crew.profile_path}
                    alt=""
                    className="rounded-full h-20 md:h-20 aspect-square object-cover"
                  />
                  <p className="font-medium text-xs mt-3">{crew.name}</p>
                </div>
              ))}
          </div>
        </div>
        <DateSelect dateTime={show.dateTime} id={id} />
        <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {shows.slice(0, 4).map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))}
        </div>
        <div
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="flex justify-center mt-20 mb-10 lg:mb-20"
        >
          <button className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer">
            Show More
          </button>
        </div>
      </div>
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur scale-90 md:scale-140">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 -right-4 md:-right-20 bg-white/80 rounded-full px-3 py-1 text-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${show.movie.trailerKey}`}
                title="YouTube Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <Loading />
  );
};

export default MovieDetail;
