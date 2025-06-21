import { clerkClient } from "@clerk/express";
import Booking from "../models/booking.model.js";
import Movie from "../models/movie.model.js";

// API controller Function to get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const user = req.auth().userId;
    const bookings = await Booking.find(user)
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API controller Function to update Favourite movie in clerk user metadata
export const updateFavourite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);
    if (!user.privateMetadata.favourite) {
      user.privateMetadata.favourite = [];
    }
    if (!user.privateMetadata.favourite.includes(movieId)) {
      user.privateMetadata.favourite.push(movieId);
    } else {
      user.privateMetadata.favourite = user.privateMetadata.favourite.filter(
        (item) => item !== movieId
      );
    }
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });

    res.json({ success: true, message: "Favourite updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getFavourite = async (req, res) => {
  try {
    const user = await clerkClient.users.getUser(req.auth().userId);
    const favourites = user.privateMetadata.favourite;

    //Get movies from database
    const movie = await Movie.find({ _id: { $in: favourites } });

    res.json({ success: true, movie });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
