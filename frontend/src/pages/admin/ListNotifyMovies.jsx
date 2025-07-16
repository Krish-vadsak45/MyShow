import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import toast from "react-hot-toast";

const ListNotifyMovies = () => {
  const { axios, getToken, image_base_url } = useAppContext();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifyMovies = async () => {
    try {
      const { data } = await axios.get("/api/admin/notify-movies", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setMovies(data.movies);
      } else {
        toast.error(data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching notify movies");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifyMovies();
  }, []);

  return loading ? (
    <Loading />
  ) : (
    <div className="ml-10 md:ml-0">
      <Title text1="Admin" text2="Notify Movies" />
      {movies.length === 0 ? (
        <p className="mt-6 text-gray-600">No movies with notify count.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="bg-primary/10 border border-primary/20 rounded-md p-4"
            >
              <img
                src={image_base_url + movie.posterPath}
                alt={movie.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="mt-2 font-semibold">{movie.title}</h3>
              <p className="text-sm text-gray-600">
                Release Date: {new Date(movie.releaseDate).toLocaleDateString()}
              </p>
              <p className="mt-1 font-medium">
                Notify Count: {movie.notifyUsers.length}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListNotifyMovies;
