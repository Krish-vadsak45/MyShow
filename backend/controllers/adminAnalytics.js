import User from "../models/user.model.js";
import logger from "../config/logger.js";
import Booking from "../models/booking.model.js";
import redis from "../config/redis.js";

const ANALYTICS_CACHE_KEY = "admin:analytics";
const ANALYTICS_CACHE_TTL = 30 * 60; // 30 minutes

export const getAdminAnalytics = async (req, res) => {
  try {
    const cached = await redis.get(ANALYTICS_CACHE_KEY);
    if (cached) return res.json(JSON.parse(cached));
    // 1. Total Sales Per Day
    const salesPerDay = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. Top 5 Most Booked Movies
    const topMovies = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: "$show.movie",
          bookings: { $sum: 1 },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
    ]);

    // 3. Bookings Per Hour
    const bookingsPerHour = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4. Tickets Sold Per Movie
    const ticketsPerMovie = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: "$show.movie",
          ticketsSold: { $sum: { $size: "$bookedSeats" } },
        },
      },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      { $sort: { ticketsSold: -1 } },
    ]);

    // 5. Total Registered Users
    const totalUsers = await User.countDocuments();

    const payload = {
      success: true,
      salesPerDay,
      topMovies,
      bookingsPerHour,
      ticketsPerMovie,
      totalUsers,
    };
    await redis.set(ANALYTICS_CACHE_KEY, JSON.stringify(payload), "EX", ANALYTICS_CACHE_TTL);
    res.json(payload);
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};
