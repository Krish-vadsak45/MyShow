import stripe from "stripe";
import logger from "../config/logger.js";
import Booking from "../models/booking.model.js";
import { inngest } from "../inngest/index.js";
import redis from "../config/redis.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  // ── 1. Verify signature — reject anything unsigned ──────────────────────────
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    logger.error({ err: error }, "Stripe webhook signature error");
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  // ── 2. Dispatch by event type ────────────────────────────────────────────────
  try {
    // checkout.session.completed fires as soon as payment succeeds.
    // The session object carries metadata directly — no extra Stripe API call needed.
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { bookingId, userId } = session.metadata;

      if (bookingId) {
        // ── 2a. Mark booking paid — critical state, done inline before responding ──
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });

        // ── 2b. Bust time-sensitive caches immediately ────────────────────────────
        await Promise.all([
          redis.del("admin:dashboard"),        // revenue / booking count widget
          redis.del("admin:analytics"),        // pre-computed analytics chart data
          redis.del("admin:bookings:1:100"),   // default admin bookings list page
          userId ? redis.del(`user:bookings:${userId}`) : Promise.resolve(),
        ]);

        // ── 2c. Queue all side-effects — email, recommendation refresh ────────────
        // Inngest handles retries, fan-out, and ordering. The webhook responds
        // immediately; none of these need to finish before we reply to Stripe.
        const events = [{ name: "app/show.booked", data: { bookingId } }];
        if (userId) {
          // Pre-warm the recommendation cache with the user's new booking history
          events.push({ name: "app/user.recommendation.refresh", data: { userId } });
        }
        await inngest.send(events);

        logger.info({ bookingId, userId }, "Payment confirmed, side-effects queued");
      } else {
        logger.warn({ sessionId: session.id }, "checkout.session.completed missing bookingId in metadata");
      }
    } else {
      logger.warn({ eventType: event.type }, "Unhandled Stripe event type");
    }

    // ── 3. Acknowledge Stripe — must respond quickly or Stripe retries ──────────
    res.json({ received: true });
  } catch (error) {
    logger.error({ err: error }, "Stripe webhook processing error");
    res.status(500).send("Internal Server Error");
  }
};
