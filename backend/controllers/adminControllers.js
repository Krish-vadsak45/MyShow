import Booking from "../models/booking.model.js";
import logger from "../config/logger.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";
import UpcomingMovie from "../models/upcomingMovie.model.js";
import redis, { getOrSetCache } from "../config/redis.js";

const DASHBOARD_CACHE_KEY = "admin:dashboard";
const DASHBOARD_CACHE_TTL = 5 * 60; // 5 minutes

export const isAdmin = (_req, res) => {
  res.json({ success: true, isAdmin: true });
};

export const getDashboardData = async (_req, res) => {
  try {
    const fetchFresh = async () => {
      const now = new Date().toISOString();
      const [bookings, activeShows, totalUser] = await Promise.all([
        Booking.find({ isPaid: true }).select("amount").lean(),
        Show.find({ showDateTime: { $gte: now } })
          .populate("movie")
          .lean(),
        User.countDocuments(),
      ]);

      const dashboardData = {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((acc, b) => acc + b.amount, 0),
        activeShows,
        totalUser,
      };

      return { success: true, dashboardData };
    };

    const payload = await getOrSetCache(
      DASHBOARD_CACHE_KEY,
      fetchFresh,
      DASHBOARD_CACHE_TTL,
    );
    res.json(payload);
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};

export const getAllShows = async (_req, res) => {
  try {
    const now = new Date().toISOString();
    const shows = await Show.find({ showDateTime: { $gte: now } })
      .populate("movie")
      .sort({ showDateTime: 1 })
      .lean();
    res.json({ success: true, shows });
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const bookings = await Booking.find({})
      .select("user show amount bookedSeats isPaid createdAt")
      .populate("user", "name email image")
      .populate({
        path: "show",
        select: "showDateTime showPrice movie",
        populate: { path: "movie", select: "title poster_path" },
      })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    res.json({ success: true, bookings });
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};

export const getNotifyMovies = async (_req, res) => {
  try {
    const today = new Date();
    const movies = await UpcomingMovie.find({
      notifyUsers: { $exists: true, $not: { $size: 0 } },
      releaseDate: { $gte: today },
    });
    res.json({ success: true, movies });
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};
