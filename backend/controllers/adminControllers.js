import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";
import UpcomingMovie from "../models/upcomingMovie.model.js";
import redis from "../config/redis.js";

const DASHBOARD_CACHE_KEY = "admin:dashboard";
const DASHBOARD_CACHE_TTL = 5 * 60; // 5 minutes

export const isAdmin = (_req, res) => {
  res.json({ success: true, isAdmin: true });
};

export const getDashboardData = async (_req, res) => {
  try {
    const cached = await redis.get(DASHBOARD_CACHE_KEY);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const now = new Date().toISOString();
    const [bookings, activeShows, totalUser] = await Promise.all([
      Booking.find({ isPaid: true }),
      Show.find({ showDateTime: { $gte: now } }).populate("movie"),
      User.countDocuments(),
    ]);

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, b) => acc + b.amount, 0),
      activeShows,
      totalUser,
    };

    const payload = { success: true, dashboardData };
    await redis.set(DASHBOARD_CACHE_KEY, JSON.stringify(payload), "EX", DASHBOARD_CACHE_TTL);

    res.json(payload);
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getAllShows = async (_req, res) => {
  try {
    const now = new Date().toISOString();
    const shows = await Show.find({ showDateTime: { $gte: now } })
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.json({ success: true, shows });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error.message);
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
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
