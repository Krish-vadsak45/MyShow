import { clerkClient } from "@clerk/express";
import Booking from "../models/booking.model.js";
import Movie from "../models/movie.model.js";

// API controller Function to get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const bookings = await Booking.find({ user: userId }).populate({
      path: "show",
      populate: { path: "movie" },
    });
    const now = new Date();
    const futureBookings = bookings.filter(
      (booking) => booking.show && new Date(booking.show.showDateTime) > now
    );
    res.json({ success: true, bookings: futureBookings });
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
    // console.log(user.privateMetadata);

    if (!user.privateMetadata.favourite) {
      user.privateMetadata.favourite = [];
    }
    if (!user.privateMetadata.favourite.includes(movieId)) {
      await user.privateMetadata.favourite.push(movieId);
    } else {
      user.privateMetadata.favourite =
        await user.privateMetadata.favourite.filter((item) => item !== movieId);
    }
    // console.log(user.privateMetadata);

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });
    // console.log(user.privateMetadata);

    res.json({ success: true, message: "Favourite updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getFavourite = async (req, res) => {
  try {
    const user = await clerkClient.users.getUser(req.auth().userId);
    // console.log("getfavourites: ", user.privateMetadata);
    const favourites = user.privateMetadata.favourite;

    //Get movies from database
    const movie = await Movie.find({ _id: { $in: favourites } });

    res.json({ success: true, movie });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
