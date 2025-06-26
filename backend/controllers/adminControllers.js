import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";

// API to check if a user is a admin
export const isAdmin = (req, res) => {
  // console.log(isAdmin);
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const now = new Date().toISOString();
    // console.log("Server time (UTC):", now.toISOString());
    const activeShows = await Show.find({
      showDateTime: { $gte: now },
    }).populate("movie");

    // console.log("active ;", activeShows);
    // console.log("Server time (UTC):", new Date().toISOString());
    // activeShows.forEach((show) => {
    //   console.log("Show (UTC):", show.showDateTime.toISOString());
    // });

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
    console.log("hello", shows);
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
