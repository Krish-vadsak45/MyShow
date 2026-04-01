import stripe from "stripe";
import logger from "../config/logger.js";
import Booking from "../models/booking.model.js";
import { inngest } from "../inngest/index.js";
import redis from "../config/redis.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    logger.error({ err: error }, "Stripe webhook signature error");
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        const session = sessionList.data[0];
        const { bookingId } = session.metadata;

        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });

        // Bust dashboard cache — revenue/booking count changed
        await redis.del("admin:dashboard");

        // Send confirmation email
        await inngest.send({
          name: "app/show.booked",
          data: { bookingId },
        });

        break;
      }

      default:
        logger.warn({ eventType: event.type }, "Unhandled Stripe event type");
    }
    res.json({ received: true });
  } catch (error) {
    logger.error({ err: error }, "Stripe webhook processing error");
    res.status(500).send("Internal Server Error");
  }
};
