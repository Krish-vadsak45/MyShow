import { clerkClient } from "@clerk/express";
import Booking from "../models/booking.model.js";
import Movie from "../models/movie.model.js";
import stripe from "stripe";
import { inngest } from "../inngest/index.js";

// API controller Function to get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const bookings = await Booking.find({ user: userId }).populate({
      path: "show",
      populate: { path: "movie" },
    });

    // Check payment status for unpaid bookings
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    for (const booking of bookings) {
      if (!booking.isPaid && booking.paymentLink) {
        try {
          // Extract session ID from payment link
          // Format: https://checkout.stripe.com/c/pay/cs_test_...#...
          const match = booking.paymentLink.match(/cs_(test|live)_[\w]+/);
          if (match) {
            const sessionId = match[0];
            const session =
              await stripeInstance.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === "paid") {
              booking.isPaid = true;
              booking.paymentLink = "";
              await booking.save();

              // Send Confirmation email via Inngest
              await inngest.send({
                name: "app/show.booked",
                data: { bookingId: booking._id },
              });
            }
          }
        } catch (err) {
          console.error(
            `Error verifying payment for booking ${booking._id}:`,
            err.message,
          );
        }
      }
    }

    const now = new Date();
    const futureBookings = bookings.filter(
      (booking) => booking.show && new Date(booking.show.showDateTime) > now,
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
    const { userId } = await req.auth();

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
    const { userId } = await req.auth();
    const user = await clerkClient.users.getUser(userId);
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
