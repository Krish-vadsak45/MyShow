import axios from "axios";
import logger from "../config/logger.js";
import UpcomingMovie from "../models/upcomingMovie.model.js";
import redis, { getOrSetCache } from "../config/redis.js";
import { inngest } from "../inngest/index.js";

const UPCOMING_CACHE_KEY = "upcoming:movies";
const UPCOMING_CACHE_TTL = 60 * 60; // 1 hour

export const fetchUpcoming = async (_req, res) => {
  try {
    const fetchFresh = async () => {
      const today = new Date();
      const from = new Date(today);
      from.setDate(from.getDate() + 1);
      const to = new Date(today);
      to.setDate(to.getDate() + 10);

      const url = `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${from
        .toISOString()
        .slice(0, 10)}&primary_release_date.lte=${to
        .toISOString()
        .slice(0, 10)}`;

      const [{ data }, dbMovies] = await Promise.all([
        axios.get(url, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            accept: "application/json",
          },
        }),
        UpcomingMovie.find(
          { releaseDate: { $gte: from, $lte: to } },
          { tmdbId: 1, notifyUsers: 1 },
        ),
      ]);

      const notifyMap = new Map(
        dbMovies.map((m) => [m.tmdbId, m.notifyUsers.length]),
      );

      if (data.results.length > 0) {
        await UpcomingMovie.bulkWrite(
          data.results.map((m) => ({
            updateOne: {
              filter: { tmdbId: m.id },
              update: {
                $setOnInsert: {
                  tmdbId: m.id,
                  title: m.title,
                  posterPath: m.poster_path,
                  releaseDate: m.release_date,
                },
              },
              upsert: true,
            },
          })),
        );
      }

      return data.results.map((m) => ({
        tmdbId: m.id,
        title: m.title,
        posterPath: m.poster_path,
        releaseDate: m.release_date,
        notifyCount: notifyMap.get(m.id) ?? 0,
      }));
    };

    const finalResult = await getOrSetCache(
      UPCOMING_CACHE_KEY,
      fetchFresh,
      UPCOMING_CACHE_TTL,
    );
    res.json(finalResult);
  } catch (err) {
    logger.error({ err }, "fetchUpcoming error");
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleNotify = async (req, res) => {
  try {
    const { tmdbId } = req.body;
    const userId = req.user.id;
    const movie = await UpcomingMovie.findOne({ tmdbId });
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    const idx = movie.notifyUsers.findIndex((u) => u.toString() === userId);
    let notify;
    if (idx === -1) {
      movie.notifyUsers.push(userId);
      notify = true;
    } else {
      movie.notifyUsers.splice(idx, 1);
      notify = false;
    }
    await movie.save();

    // Bust upcoming cache so notify counts update
    await redis.del(UPCOMING_CACHE_KEY);

    res.json({ notify });
  } catch (err) {
    logger.error({ err }, "toggleNotify error");
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserNotified = async (req, res) => {
  try {
    const userId = req.user.id;
    const movies = await UpcomingMovie.find({ notifyUsers: userId });
    const notifiedIds = movies.map((m) => m.tmdbId);
    res.json({ notified: notifiedIds });
  } catch (err) {
    logger.error({ err }, "getUserNotified error");
    res.status(500).json({ success: false, message: err.message });
  }
};

export const adminList = async (_req, res) => {
  try {
    const today = new Date();
    const movies = await UpcomingMovie.find({
      notifyUsers: { $exists: true, $not: { $size: 0 } },
      releaseDate: { $gte: today },
    });
    res.json(movies);
  } catch (err) {
    logger.error({ err }, "adminList error");
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fire-and-forget: hand off to Inngest so this call returns instantly.
// All email fan-out, retry logic, and the notified-flag update live in the
// `notify-movie-released` Inngest function — nothing blocks the calling thread.
export const notifyUsers = async (tmdbId) => {
  try {
    await inngest.send({
      name: "app/movie.released",
      data: { tmdbId },
    });
    logger.info({ tmdbId }, "app/movie.released event queued");
  } catch (err) {
    logger.error({ err }, "Failed to queue app/movie.released event");
    throw err;
  }
};

export default {
  fetchUpcoming,
  toggleNotify,
  adminList,
  notifyUsers,
  getUserNotified,
};
