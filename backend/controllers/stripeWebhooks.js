import stripe from "stripe";
import Booking from "../models/booking.model.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  console.log("1");
  let event;
  try {
    console.log("2");

    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send("webhook error :- ", error);
  }
  console.log("3");

  try {
    console.log("4");

    switch (event.type) {
      case "payment_intent.succeeded": {
        console.log("5");

        const paymentIntent = event.data.object;
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });
        console.log("6");

        const session = sessionList.data[0];
        console.log(session);
        console.log(session.metadata);
        const { bookingId } = session.metadata;
        console.log(bookingId);
        console.log("7");

        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });
        console.log("8");

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("webhook processing error :- ", error);
    res.status(500).send("Internal Server Error");
  }
};
