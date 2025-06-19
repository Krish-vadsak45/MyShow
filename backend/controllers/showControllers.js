import axios from "axios";

export const getNowPlayingMovies = async (req, res) => {
  try {
    console.log("TMDB API KEY:", process.env.TMDB_API_KEY);

    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        accept: "application/json",
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        timeout: 10000,
      }
    );
    console.log("TMDB API KEY:", process.env.TMDB_API_KEY);

    console.log(data);
    const movies = data.results;
    res.json({ success: true, movies: movies });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
