import Show from "../models/show.model.js";
import logger from "../config/logger.js";
import Booking from "../models/booking.model.js";
import stripe from "stripe";
import { inngest } from "../inngest/index.js";
import redis from "../config/redis.js";
import z from "zod";

const SEAT_LOCK_TTL = 5 * 60; // 5 minutes in seconds
const seatKey = (showId, seatId) => `seat:${showId}:${seatId}`;

// ─── Validation Schemas ───────────────────────────────────────────────────────
const SEAT_REGEX = /^[A-J][1-9]$/;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const seatActionSchema = z.object({
  showId: z.string().regex(OBJECT_ID_REGEX, "Invalid show ID"),
  seatId: z
    .string()
    .regex(SEAT_REGEX, "Invalid seat format — use A1 through J9"),
});

const createBookingSchema = z.object({
  showId: z.string().regex(OBJECT_ID_REGEX, "Invalid show ID"),
  selectedSeats: z
    .array(
      z.string().regex(SEAT_REGEX, "Invalid seat format — use A1 through J9"),
    )
    .min(1, "Select at least 1 seat")
    .max(10, "Cannot book more than 10 seats at once")
    .refine(
      (seats) => new Set(seats).size === seats.length,
      "Duplicate seats are not allowed",
    ),
});
// ─────────────────────────────────────────────────────────────────────────────

// Atomic unlock — only deletes the key if it belongs to this specific session
const unlockScript = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export const lockSeats = async (req, res) => {
  try {
    const parsed = seatActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.flatten() });
    }
    const userId = req.userId;
    const { showId, seatId } = parsed.data;
    // Use a unique lock token (userId + timestamp) to prevent accidental releases
    const lockToken = `${userId}:${Date.now()}`;

    try {
      // NX = only set if key does NOT exist → atomic "first writer wins"
      const acquired = await redis.set(
        seatKey(showId, seatId),
        lockToken,
        "EX",
        SEAT_LOCK_TTL,
        "NX",
      );

      if (!acquired) {
        return res.json({
          success: false,
          message: "Seat already taken or locked",
        });
      }
    } catch (redisErr) {
      // Redis is down — seat won't appear locked to other users, but the
      // MongoDB atomic guard in createBooking still prevents double-booking.
      logger.warn(
        { err: redisErr },
        "Redis unavailable during lockSeats — degraded mode",
      );
    }

    res.json({ success: true, lockToken });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const unlockSeats = async (req, res) => {
  try {
    const parsed = seatActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.flatten() });
    }
    const { lockToken } = req.body;
    const { showId, seatId } = parsed.data;

    if (!lockToken) {
      return res
        .status(400)
        .json({
          success: false,
          message: "lockToken is required for unlocking",
        });
    }

    await redis.eval(unlockScript, 1, seatKey(showId, seatId), lockToken);

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.flatten() });
    }
    const userId = req.userId;
    const { showId, selectedSeats } = parsed.data;
    const { origin } = req.headers;

    // Verify every seat is still Redis-locked by this user.
    // If Redis is down we skip this check and fall through to the MongoDB
    // atomic guard below, which provides the same concurrent-safety guarantee.
    let redisHealthy = true;
    try {
      const lockValues = await redis.mget(
        ...selectedSeats.map((s) => seatKey(showId, s)),
      );
      // Valid if all lock values exist and start with the current userId
      const valid = lockValues.every((val) => val?.startsWith(`${userId}:`));
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Seat reservation expired. Please select again.",
        });
      }
    } catch (redisErr) {
      logger.warn(
        { err: redisErr },
        "Redis unavailable — skipping lock check, falling back to MongoDB guard",
      );
      redisHealthy = false;
    }

    // Atomically claim seats — only succeeds if every seat is still free in MongoDB.
    // This guards against the TOCTOU window between the Redis check above and the
    // DB write: if Redis restarts or a TTL expires mid-flow, a concurrent booking
    // that already wrote to MongoDB will be detected here rather than overwritten.
    const query = { _id: showId };
    selectedSeats.forEach((seat) => {
      query[`occupiedSeats.${seat}`] = { $exists: false };
    });
    const update = { $set: {} };
    selectedSeats.forEach((seat) => {
      update.$set[`occupiedSeats.${seat}`] = userId;
    });

    const showData = await Show.findOneAndUpdate(query, update, {
      new: true,
    }).populate("movie");

    if (!showData) {
      return res.status(409).json({
        success: false,
        message:
          "One or more seats were just booked by another user. Please re-select.",
      });
    }

    // Release Redis locks — MongoDB is now the source of truth for these seats.
    // If Redis is down or was already unhealthy, skip: the keys will expire via TTL.
    if (redisHealthy) {
      try {
        await redis.del(...selectedSeats.map((s) => seatKey(showId, s)));
      } catch (redisErr) {
        logger.warn(
          { err: redisErr },
          "Redis unavailable during lock release — TTL will clean up",
        );
      }
    }

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
          currency: "inr",
          product_data: { name: showData.movie.title },
          unit_amount: Math.floor(booking.amount) * 100, // paise (1 INR = 100 paise)
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

    // Invalidate recommendation cache — user's genre history just changed
    redis.del(`recommendations:${userId}`).catch(() => {});

    // Inngest still checks payment status after 10 min and cleans up if unpaid
    await inngest.send({
      name: "app/checkpayment",
      data: { bookingId: booking._id.toString() },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    // MongoDB: permanently booked seats (post-booking-creation)
    const showData = await Show.findById(showId).select("occupiedSeats").lean();
    const permanentSeats = Object.keys(showData.occupiedSeats);

    // Redis: temp-locked seats still in checkout.
    // Uses SCAN instead of KEYS — non-blocking, iterates in small batches so it
    // never stalls the Redis event loop regardless of keyspace size.
    // If Redis is down, degrade gracefully — only permanently booked seats are returned.
    let tempLockedSeats = [];
    try {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          `seat:${showId}:*`,
          "COUNT",
          100,
        );
        cursor = nextCursor;
        keys.forEach((k) => tempLockedSeats.push(k.split(":")[2]));
      } while (cursor !== "0");
    } catch (redisErr) {
      logger.warn(
        { err: redisErr },
        "Redis unavailable — returning MongoDB-only seat data",
      );
    }

    // Union — deduplicate
    const occupiedSeats = [...new Set([...permanentSeats, ...tempLockedSeats])];

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    logger.error({ err: error });
    res.json({ success: false, message: error.message });
  }
};
