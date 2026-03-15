import Show from "../models/show.model.js";
import Booking from "../models/booking.model.js";
import stripe from "stripe";
import { inngest } from "../inngest/index.js";
import redis from "../config/redis.js";

const SEAT_LOCK_TTL = 5 * 60; // 5 minutes in seconds
const seatKey = (showId, seatId) => `seat:${showId}:${seatId}`;

// Atomic unlock — only deletes the key if it still belongs to this user
const unlockScript = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export const lockSeats = async (req, res) => {
  try {
    const userId = req.userId;
    const { showId, seatId } = req.body;

    // NX = only set if key does NOT exist → atomic "first writer wins"
    const acquired = await redis.set(
      seatKey(showId, seatId),
      userId,
      "EX",
      SEAT_LOCK_TTL,
      "NX",
    );

    if (!acquired) {
      return res.json({ success: false, message: "Seat already taken or locked" });
    }

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const unlockSeats = async (req, res) => {
  try {
    const userId = req.userId;
    const { showId, seatId } = req.body;

    await redis.eval(unlockScript, 1, seatKey(showId, seatId), userId);

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Verify every seat is still Redis-locked by this user
    const lockValues = await redis.mget(
      ...selectedSeats.map((s) => seatKey(showId, s)),
    );
    const valid = lockValues.every((val) => val === userId);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Seat reservation expired. Please select again.",
      });
    }

    const showData = await Show.findById(showId).populate("movie");

    // Permanently mark seats in MongoDB (persists across Redis restarts)
    const permanentUpdate = {};
    selectedSeats.forEach((s) => (permanentUpdate[`occupiedSeats.${s}`] = userId));
    await Show.updateOne({ _id: showId }, { $set: permanentUpdate });

    // Release Redis locks — MongoDB is now the source of truth for these seats
    await redis.del(...selectedSeats.map((s) => seatKey(showId, s)));

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: { name: showData.movie.title },
          unit_amount: Math.floor(booking.amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/mybookings`,
      cancel_url: `${origin}/mybookings`,
      line_items,
      mode: "payment",
      metadata: { bookingId: booking._id.toString() },
      expires_at: Math.floor(Date.now() / 1000) + 32 * 60,
    });

    booking.paymentLink = session.url;
    await booking.save();

    // Inngest still checks payment status after 10 min and cleans up if unpaid
    await inngest.send({
      name: "app/checkpayment",
      data: { bookingId: booking._id.toString() },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    // MongoDB: permanently booked seats (post-booking-creation)
    const showData = await Show.findById(showId);
    const permanentSeats = Object.keys(showData.occupiedSeats);

    // Redis: temp-locked seats still in checkout
    const redisKeys = await redis.keys(`seat:${showId}:*`);
    const tempLockedSeats = redisKeys.map((k) => k.split(":")[2]);

    // Union — deduplicate
    const occupiedSeats = [...new Set([...permanentSeats, ...tempLockedSeats])];

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
