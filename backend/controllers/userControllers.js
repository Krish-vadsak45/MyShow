import { clerkClient } from "@clerk/express";
import logger from "../config/logger.js";
import Booking from "../models/booking.model.js";
import Movie from "../models/movie.model.js";
import stripe from "stripe";
import { inngest } from "../inngest/index.js";
import redis, { getCachedData } from "../config/redis.js";

const USER_BOOKINGS_TTL = 10 * 60; // 10 minutes
const USER_FAVOURITES_TTL = 30 * 60; // 30 minutes

// API controller Function to get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "Authentication required" });
    }

    const cacheKey = `user:bookings:${userId}`;
    const cached = await getCachedData(cacheKey);
    if (cached) return res.json(cached);

    const bookings = await Booking.find({ user: userId }).populate({
      path: "show",
      populate: { path: "movie" },
    });

    // Check payment status for unpaid bookings — all Stripe calls run in parallel
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    let changed = false;
    await Promise.all(
      bookings
        .filter((b) => !b.isPaid && b.paymentLink)
        .map(async (booking) => {
          try {
            const match = booking.paymentLink.match(/cs_(test|live)_\w+/);
            if (match) {
              const session = await stripeInstance.checkout.sessions.retrieve(
                match[0],
              );
              if (session.payment_status === "paid") {
                booking.isPaid = true;
                booking.paymentLink = "";
                await booking.save();
                changed = true;
                await inngest.send({
                  name: "app/show.booked",
                  data: { bookingId: booking._id },
                });
              }
            }
          } catch (err) {
            logger.error(
              { err, bookingId: booking._id },
              "Error verifying payment for booking",
            );
          }
        }),
    );

    const now = new Date();
    const futureBookings = bookings.filter(
      (booking) => booking.show && new Date(booking.show.showDateTime) > now,
    );

    const payload = { success: true, bookings: futureBookings };
    await redis.set(cacheKey, JSON.stringify(payload), "EX", USER_BOOKINGS_TTL);

    res.json(payload);
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};

// API controller Function to update Favourite movie in clerk user metadata
export const updateFavourite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "Authentication required" });
    }

    const user = await clerkClient.users.getUser(userId);
    const favourites = user.privateMetadata.favourite ?? [];

    const updated = favourites.includes(movieId)
      ? favourites.filter((item) => item !== movieId)
      : [...favourites, movieId];

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { ...user.privateMetadata, favourite: updated },
    });

    // Invalidate caches
    await redis.del(`user:favourite:${userId}`);
    await redis.del(`recommendations:${userId}`);

    res.json({ success: true, message: "Favourite updated successfully" });
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};

export const getFavourite = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "Authentication required" });
    }

    const cacheKey = `user:favourite:${userId}`;
    const cached = await getCachedData(cacheKey);
    if (cached) return res.json(cached);

    const user = await clerkClient.users.getUser(userId);
    const favourites = user.privateMetadata.favourite || [];

    //Get movies from database
    const movie = await Movie.find({ _id: { $in: favourites } });

    const payload = { success: true, movie };
    await redis.set(
      cacheKey,
      JSON.stringify(payload),
      "EX",
      USER_FAVOURITES_TTL,
    );

    res.json(payload);
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};
