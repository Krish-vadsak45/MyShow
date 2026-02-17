import Show from "../models/show.model.js";
import Booking from "../models/booking.model.js";
import stripe from "stripe";
import { inngest } from "../inngest/index.js";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) {
      return false;
    }

    const occupiedSeats = showData.occupiedSeats;
    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isAnySeatTaken;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

export const lockSeats = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { showId, seatId } = req.body;

    // Atomic update: only set if the seat key doesn't exist
    const show = await Show.findOneAndUpdate(
      { _id: showId, [`occupiedSeats.${seatId}`]: { $exists: false } },
      { $set: { [`occupiedSeats.${seatId}`]: userId } },
      { new: true },
    );

    if (!show) {
      return res.json({
        success: false,
        message: "Seat already taken or locked",
      });
    }

    // Schedule auto-unlock after 5 mins if no booking created
    await inngest.send({
      name: "app/seats.locked",
      data: { showId, seatId, userId },
    });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const unlockSeats = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { showId, seatId } = req.body;

    // Only unlock if it was locked by this user
    await Show.updateOne(
      { _id: showId, [`occupiedSeats.${seatId}`]: userId },
      { $unset: { [`occupiedSeats.${seatId}`]: "" } },
    );

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Verify all seats are still locked by this user
    const showData = await Show.findById(showId).populate("movie");
    const valid = selectedSeats.every(
      (seat) => showData.occupiedSeats[seat] === userId,
    );

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Seat reservation expired. Please select again.",
      });
    }

    // Now that seats are safely "temporary booked" (locked), create the booking record
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    // Stripe Gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    //Creating line items to for stripe
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: showData.movie.title,
          },
          unit_amount: Math.floor(booking.amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/mybookings`,
      cancel_url: `${origin}/mybookings`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    booking.paymentLink = session.url;
    await booking.save();

    // Run inngest sheduler function to check payment ststus after 10 minuts
    await inngest.send({
      name: "app/checkpayment",
      data: {
        bookingId: booking._id.toString(),
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

//
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    const occupiedSeats = Object.keys(showData.occupiedSeats);
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
