import axios from "axios";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";
import UpcomingMovie from "../models/upcomingMovie.model.js";
import { inngest } from "../inngest/index.js";
import redis from "../config/redis.js";

const SHOWS_CACHE_TTL = 10 * 60; // 10 minutes
const SHOW_DETAIL_CACHE_TTL = 10 * 60;

// Invalidate all paginated show listing cache keys
const invalidateShowsCache = async () => {
  const keys = await redis.keys("shows:list:*");
  if (keys.length > 0) await redis.del(...keys);
};

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (_req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        accept: "application/json",
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );
    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get notify count for a list of movie tmdbIds
export const getNotifyCount = async (req, res) => {
  try {
    const { tmdbIds } = req.body;
    if (!Array.isArray(tmdbIds)) {
      return res.status(400).json({ success: false, message: "tmdbIds must be an array" });
    }

    const notifyCounts = await Promise.all(
      tmdbIds.map(async (id) => {
        const upcomingMovie = await UpcomingMovie.findOne({ tmdbId: id });
        const count = upcomingMovie ? upcomingMovie.notifyUsers.length : 0;
        return { tmdbId: id, notifyCount: count };
      })
    );

    res.json({ success: true, notifyCounts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to add a new show — also busts the show listings cache
export const addShow = async (req, res) => {
  try {
    const { movieId, showInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      const [movieDetailResponse, movieCreditResponse, movieTrailerResponse] =
        await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
          }),
        ]);

      const movieApiData = movieDetailResponse.data;
      const movieCreditData = movieCreditResponse.data;
      const movieTrailerData = movieTrailerResponse.data;
      const trailer = movieTrailerData.results.find(
        (vid) => vid.type === "Trailer" && vid.site === "YouTube"
      );

      movie = await Movie.create({
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        genres: movieApiData.genres,
        cast: movieCreditData.cast,
        crew: movieCreditData.crew,
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
        trailerKey: trailer ? trailer.key : null,
      });
    }

    const showsToCreate = [];
    showInput.forEach((show) => {
      show.time.forEach((time) => {
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(`${show.date}T${time}`),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    // Bust show listings cache so new shows appear immediately
    await invalidateShowsCache();

    await inngest.send({
      name: "app/show.added",
      data: { movieTitle: movie.title },
    });

    res.json({ success: true, message: "show added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows (paginated + filtered) — cached in Redis
export const getShows = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 16,
      search,
      genres,
      languages,
      dateFrom,
      dateTo,
    } = req.query;

    // Build a stable cache key from all query params
    const cacheKey = `shows:list:${page}:${limit}:${search || ""}:${genres || ""}:${languages || ""}:${dateFrom || ""}:${dateTo || ""}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const now = new Date();
    const shows = await Show.find({ showDateTime: { $gte: now } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueMoviesMap = new Map();
    shows.forEach((show) => {
      const movieId = show.movie._id?.toString();
      if (!uniqueMoviesMap.has(movieId)) {
        uniqueMoviesMap.set(movieId, show.movie);
      }
    });

    let movies = Array.from(uniqueMoviesMap.values());

    if (search) {
      const searchLower = search.toLowerCase();
      movies = movies.filter((m) => m.title.toLowerCase().includes(searchLower));
    }
    if (genres) {
      const genreSet = new Set(genres.split(","));
      movies = movies.filter((m) => m.genres.some((mg) => genreSet.has(mg.name)));
    }
    if (languages) {
      const langSet = new Set(languages.split(","));
      movies = movies.filter((m) => langSet.has(m.original_language));
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      movies = movies.filter((m) => new Date(m.release_date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      movies = movies.filter((m) => new Date(m.release_date) <= to);
    }

    const totalMovies = movies.length;
    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const paginated = movies.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const payload = {
      success: true,
      shows: paginated,
      totalMovies,
      totalPages: Math.ceil(totalMovies / limitNum),
      currentPage: pageNum,
    };

    await redis.set(cacheKey, JSON.stringify(payload), "EX", SHOWS_CACHE_TTL);

    res.json(payload);
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get a single show's date/time slots — cached in Redis
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    const cacheKey = `show:detail:${movieId}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const now = new Date();
    const [shows, movie] = await Promise.all([
      Show.find({ movie: movieId, showDateTime: { $gte: now } }),
      Movie.findById(movieId),
    ]);

    const dateTime = {};
    shows.forEach((show) => {
      const date = new Date(show.showDateTime).toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    const payload = { success: true, movie, dateTime };
    await redis.set(cacheKey, JSON.stringify(payload), "EX", SHOW_DETAIL_CACHE_TTL);

    res.json(payload);
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
