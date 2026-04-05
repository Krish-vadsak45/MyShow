import axios from "axios";
import logger from "../config/logger.js";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";
import UpcomingMovie from "../models/upcomingMovie.model.js";
import { inngest } from "../inngest/index.js";
import redis, { getCachedData, getOrSetCache } from "../config/redis.js";
import z from "zod";

const SHOWS_CACHE_TTL = 10 * 60; // 10 minutes
const SHOW_DETAIL_CACHE_TTL = 10 * 60;
const NOW_PLAYING_CACHE_KEY = "movies:now_playing";
const NOW_PLAYING_CACHE_TTL = 6 * 60 * 60; // 6 hours

// Helper to add jitter to TTL (±30s) to prevent cache stampede
const withJitter = (seconds) => seconds + Math.floor(Math.random() * 60 - 30);

// ─── Validation Schemas ───────────────────────────────────────────────────────
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

const addShowSchema = z.object({
  movieId: z.number().int().positive("movieId must be a positive integer"),
  showPrice: z.number().positive("showPrice must be greater than 0"),
  showInput: z
    .array(
      z.object({
        date: z
          .string()
          .regex(DATE_REGEX, "date must be YYYY-MM-DD")
          .refine(
            (d) => new Date(d) > new Date(),
            "Show date must be in the future",
          ),
        time: z
          .array(z.string().regex(TIME_REGEX, "time must be HH:MM"))
          .min(1, "Each date must have at least one time slot"),
      }),
    )
    .min(1, "At least one show slot is required"),
});
// ─────────────────────────────────────────────────────────────────────────────

// Invalidate all paginated show listing cache keys using SCAN (non-blocking)
const invalidateShowsCache = async () => {
  let cursor = "0";
  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        "shows:list:*",
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    logger.error({ err }, "Error invalidating shows cache with SCAN");
  }
};

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (_req, res) => {
  try {
    const fetchFresh = async () => {
      const { data } = await axios.get(
        "https://api.themoviedb.org/3/movie/now_playing",
        {
          accept: "application/json",
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        },
      );
      return { success: true, movies: data.results };
    };

    const payload = await getOrSetCache(
      NOW_PLAYING_CACHE_KEY,
      fetchFresh,
      NOW_PLAYING_CACHE_TTL,
    );
    res.json(payload);
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};

// API to get notify count for a list of movie tmdbIds
export const getNotifyCount = async (req, res) => {
  try {
    const { tmdbIds } = req.body;
    if (!Array.isArray(tmdbIds)) {
      return res
        .status(400)
        .json({ success: false, message: "tmdbIds must be an array" });
    }

    const notifyCounts = await Promise.all(
      tmdbIds.map(async (id) => {
        const upcomingMovie = await UpcomingMovie.findOne({ tmdbId: id });
        const count = upcomingMovie ? upcomingMovie.notifyUsers.length : 0;
        return { tmdbId: id, notifyCount: count };
      }),
    );

    res.json({ success: true, notifyCounts });
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to add a new show — also busts the show listings cache
export const addShow = async (req, res) => {
  try {
    const parsed = addShowSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.flatten() });
    }
    const { movieId, showInput, showPrice } = parsed.data;

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
        (vid) => vid.type === "Trailer" && vid.site === "YouTube",
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
    logger.error({ err: error });
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

    const cached = await getCachedData(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const now = new Date();
    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Base pipeline: future shows → join movies → deduplicate by movie
    const basePipeline = [
      { $match: { showDateTime: { $gte: now } } },
      {
        $lookup: {
          from: "movies",
          localField: "movie",
          foreignField: "_id",
          as: "movieData",
        },
      },
      { $unwind: "$movieData" },
      { $group: { _id: "$movieData._id", movie: { $first: "$movieData" } } },
    ];

    // Movie-level filter stages pushed to DB — no in-memory filtering
    const filterStages = [];
    if (search) {
      filterStages.push({
        $match: { "movie.title": { $regex: search, $options: "i" } },
      });
    }
    if (genres) {
      filterStages.push({
        $match: { "movie.genres.name": { $in: genres.split(",") } },
      });
    }
    if (languages) {
      filterStages.push({
        $match: { "movie.original_language": { $in: languages.split(",") } },
      });
    }
    if (dateFrom) {
      filterStages.push({
        $match: { "movie.release_date": { $gte: new Date(dateFrom) } },
      });
    }
    if (dateTo) {
      filterStages.push({
        $match: { "movie.release_date": { $lte: new Date(dateTo) } },
      });
    }

    // Run count and page in parallel
    const [countResult, movieDocs] = await Promise.all([
      Show.aggregate([...basePipeline, ...filterStages, { $count: "total" }]),
      Show.aggregate([
        ...basePipeline,
        ...filterStages,
        { $sort: { "movie.release_date": -1 } },
        { $skip: skip },
        { $limit: limitNum },
        { $replaceRoot: { newRoot: "$movie" } },
      ]),
    ]);

    const totalMovies = countResult[0]?.total || 0;
    const paginated = movieDocs;

    const payload = {
      success: true,
      shows: paginated,
      totalMovies,
      totalPages: Math.ceil(totalMovies / limitNum),
      currentPage: pageNum,
    };

    await redis.set(
      cacheKey,
      JSON.stringify(payload),
      "EX",
      withJitter(SHOWS_CACHE_TTL),
    );

    res.json(payload);
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};

// API to get a single show's date/time slots — cached in Redis
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    // 1. Validation First: Strict Object ID check
    if (!OBJECT_ID_REGEX.test(movieId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid movie ID format" });
    }

    const cacheKey = `show:detail:${movieId}`;

    const fetchFresh = async () => {
      const now = new Date();
      const [shows, movie] = await Promise.all([
        Show.find({ movie: movieId, showDateTime: { $gte: now } }),
        Movie.findById(movieId),
      ]);

      if (!movie) return null; // Triggers "NF" caching in getOrSetCache

      const dateTime = {};
      shows.forEach((show) => {
        const date = new Date(show.showDateTime).toISOString().split("T")[0];
        if (!dateTime[date]) dateTime[date] = [];
        dateTime[date].push({ time: show.showDateTime, showId: show._id });
      });

      return { success: true, movie, dateTime };
    };

    const payload = await getOrSetCache(
      cacheKey,
      fetchFresh,
      withJitter(SHOW_DETAIL_CACHE_TTL),
    );

    if (!payload) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    res.json(payload);
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};
