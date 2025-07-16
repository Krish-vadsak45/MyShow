import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";
import UpcomingMovie from "../models/upcomingMovie.model.js";

// API to check if a user is a admin
export const isAdmin = (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const now = new Date().toISOString();
    const activeShows = await Show.find({
      showDateTime: { $gte: now },
    }).populate("movie");

    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUser,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get all show
export const getAllShows = async (req, res) => {
  try {
    const now = new Date().toISOString();
    const shows = await Show.find({
      showDateTime: { $gte: now },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.json({ success: true, shows });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get all bookings
export const getAllBookings = async (req, res) => {
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

// API to get movies with notifyCount > 0
export const getNotifyMovies = async (req, res) => {
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
