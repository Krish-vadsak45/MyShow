import { Inngest } from "inngest";
import { clerkClient } from "@clerk/express";
import logger from "../config/logger.js";
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import UpcomingMovie from "../models/upcomingMovie.model.js";
import sendEmail from "../config/nodeMailer.js";
import redis from "../config/redis.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// ─── User Sync (Clerk webhooks) ───────────────────────────────────────────────

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      phone_numbers,
    } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
      mobile_no: phone_numbers[0].phone_number,
    };
    await User.create(userData);
  },
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete({ _id: id });
  },
);

const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      phone_numbers,
    } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
      mobile_no: phone_numbers[0].phone_number,
    };
    await User.findByIdAndUpdate(id, userData);
  },
);

// ─── Booking Lifecycle ────────────────────────────────────────────────────────

// Cancels an unpaid booking 10 minutes after creation.
// The idempotency guard (booking.isPaid check) makes this safe to retry.
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const { bookingId } = event.data;
      const booking = await Booking.findById(bookingId);

      // Idempotency guard — already paid or already cleaned up on a previous retry
      if (!booking || booking.isPaid) return;

      // Build the $unset map for every booked seat
      const unsetSeats = {};
      booking.bookedSeats.forEach((seat) => {
        unsetSeats[`occupiedSeats.${seat}`] = "";
      });

      // Atomic seat release — $unset on a missing key is a no-op, retries are safe
      await Show.updateOne({ _id: booking.show }, { $unset: unsetSeats });
      await Booking.findByIdAndDelete(bookingId);

      // Bust dashboard cache — booking count changed
      await redis.del("admin:dashboard");
    });
  },
);

// ─── Emails ───────────────────────────────────────────────────────────────────

// Sends a booking confirmation email after payment is confirmed.
const sendBookingComfirmationEmail = inngest.createFunction(
  { id: "send-booking-comfirmation-email" },
  { event: "app/show.booked" },
  async ({ event }) => {
    const { bookingId } = event.data;
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation :- "${booking.show.movie.title}" booked!`,
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hi ${booking.user.name},</h2>
          <p>
            Your booking for
            <strong style="color: #F84565;">"${booking.show.movie.title}"</strong>
            is confirmed.
          </p>
          <p>
            <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}<br/>
            <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}
          </p>
          <p>Enjoy the show!</p>
          <p>Visit our website: <a href="https://myshow-eight.vercel.app/">MyShow</a></p>
          <br/>
          <p>Thanks for booking with us!<br/>– MyShow Team</p>
        </div>
      `,
    });
  },
);

// Sends reminder emails to all users with shows in the next 8 hours.
// Runs every 8 hours via cron.
const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminders" },
  { cron: "0 */8 * * *" },
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.find({
        showDateTime: { $gte: windowStart, $lte: in8Hours },
      }).populate("movie");

      const tasks = [];
      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;
        const userIds = [...new Set(Object.values(show.occupiedSeats))];
        if (userIds.length === 0) continue;
        const users = await User.find({ _id: { $in: userIds } }).select("name email");
        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showTime: show.showDateTime,
          });
        }
      }
      return tasks;
    });

    if (reminderTasks.length === 0) return { sent: 0, message: "No reminders to send" };

    const results = await step.run("send-all-reminders", async () => {
      return await Promise.allSettled(
        reminderTasks.map((task) =>
          sendEmail({
            to: task.userEmail,
            subject: `Reminder: "${task.movieTitle}" starts in ~8 hours`,
            body: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hello ${task.userName},</h2>
                <p>This is a quick reminder that your movie:</p>
                <h3 style="color: #F84565;">"${task.movieTitle}"</h3>
                <p>
                  is scheduled for
                  <strong>${new Date(task.showTime).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}</strong>
                  at <strong>${new Date(task.showTime).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}</strong>.
                </p>
                <p>It starts in approximately <strong>8 hours</strong> — make sure you're ready!</p>
                <br/>
                <p>Visit our website: <a href="https://myshow-eight.vercel.app/">MyShow</a></p>
                <br/>
                <p>Enjoy the show!<br/>– MyShow Team</p>
              </div>
            `,
          }),
        ),
      );
    });

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;
    return { sent, failed, message: `Sent ${sent} reminder(s), failed ${failed}` };
  },
);

// Broadcasts a "new show added" email to every user.
const sendNewShowNotifications = inngest.createFunction(
  { id: "send-new-show-notifications" },
  { event: "app/show.added" },
  async ({ event }) => {
    if (!event.data?.movieTitle) {
      logger.error({ eventData: event.data }, "Missing movieTitle in event.data");
      return;
    }
    const { movieTitle } = event.data;
    const users = await User.find({});
    const results = await Promise.allSettled(
      users.map((user) =>
        sendEmail({
          to: user.email,
          subject: `New Movie Added: ${movieTitle}`,
          body: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hi ${user.name},</h2>
              <p>We've just added a new show to our library!</p>
              <h3 style="color: #F84565;">"${movieTitle}"</h3>
              <p>Visit our website: <a href="https://myshow-eight.vercel.app/">MyShow</a></p>
              <br/>
              <p>Thanks,<br/>– MyShow Team</p>
            </div>
          `,
        }),
      ),
    );
    const sent = results.filter((r) => r.status === "fulfilled").length;
    return { message: `Notifications sent: ${sent}/${users.length}` };
  },
);

// ─── Movie Release Notifications ──────────────────────────────────────────────

// Fans out release-day emails to every user who clicked "Notify Me" for a movie.
// Triggered by notifyUsers() in upcomingControllers — replaces the old sync loop.
//
// Steps let Inngest checkpoint progress so a partial failure (e.g. email provider
// hiccup) only retries the failed step, not the entire fan-out from scratch.
const notifyMovieReleased = inngest.createFunction(
  { id: "notify-movie-released", retries: 3 },
  { event: "app/movie.released" },
  async ({ event, step }) => {
    const { tmdbId } = event.data;

    // Step 1 — Load recipients (checkpointed; won't re-query on email-step retry)
    const { movie, users } = await step.run("fetch-recipients", async () => {
      const m = await UpcomingMovie.findOne({ tmdbId }).populate(
        "notifyUsers",
        "name email",
      );
      if (!m || m.notified || !m.notifyUsers?.length) {
        return { movie: null, users: [] };
      }
      return {
        movie: { _id: m._id.toString(), title: m.title, tmdbId: m.tmdbId },
        // Serialise to plain objects so Inngest can checkpoint across steps
        users: m.notifyUsers.map((u) => ({ email: u.email, name: u.name })),
      };
    });

    if (!movie) {
      logger.info({ tmdbId }, "notify-movie-released: nothing to send (already notified or no subscribers)");
      return { sent: 0, skipped: true };
    }

    // Step 2 — Fan out emails concurrently (Promise.allSettled = partial failure OK)
    const results = await step.run("send-release-emails", async () => {
      const frontendUrl = process.env.FRONTEND_URL || "https://myshow-eight.vercel.app";
      const bookingUrl = `${frontendUrl}/movies/${movie.tmdbId}`;
      const unsubscribeUrl = `${frontendUrl}/upcoming`;

      return await Promise.allSettled(
        users.map((user) =>
          sendEmail({
            to: user.email,
            subject: `"${movie.title}" is now playing – book your tickets!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>Hi ${user.name},</h2>
                <p>
                  Good news! The movie you asked us to watch —
                  <strong style="color: #F84565;">"${movie.title}"</strong> —
                  is now playing at your favourite theatre.
                </p>
                <p>Click the button below to choose your seats before they sell out:</p>
                <p style="text-align: center; margin: 24px 0;">
                  <a href="${bookingUrl}"
                    style="background:#F84565;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
                    Book Tickets
                  </a>
                </p>
                <p>See you at the movies!</p>
                <p>Thanks for using MyShow<br/>– The MyShow Team</p>
                <hr style="border:none;border-top:1px solid #eaeaea;margin:32px 0;"/>
                <small style="color:#888;">
                  You're receiving this because you clicked "Notify Me" for "${movie.title}".
                  <a href="${unsubscribeUrl}">Unsubscribe</a>.
                </small>
              </div>
            `,
          }),
        ),
      );
    });

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    // Step 3 — Mark movie as notified so this job never re-runs for the same movie
    await step.run("mark-notified", async () => {
      await UpcomingMovie.findOneAndUpdate({ tmdbId }, { $set: { notified: true } });
    });

    logger.info({ tmdbId, sent, failed, total: users.length }, "Movie release notifications sent");
    return { sent, failed, total: users.length };
  },
);

// ─── Analytics Pre-computation ────────────────────────────────────────────────

// Runs every 30 minutes and stores the result in Redis so the analytics endpoint
// never blocks on heavy aggregations at request time.
//
// Uses a single $facet pipeline to run all four aggregations in ONE MongoDB
// round-trip instead of four separate queries.
const preComputeAnalytics = inngest.createFunction(
  { id: "pre-compute-analytics", retries: 2 },
  { cron: "*/30 * * * *" },
  async ({ step }) => {
    const payload = await step.run("run-aggregations", async () => {
      const [facet] = await Booking.aggregate([
        { $match: { isPaid: true } },
        {
          $facet: {
            // Total revenue + booking count grouped by calendar day
            salesPerDay: [
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  totalSales: { $sum: "$amount" },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            // Booking volume by hour of day (0–23) — useful for peak-hour charts
            bookingsPerHour: [
              {
                $group: {
                  _id: { $hour: "$createdAt" },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            // Top 5 most-booked movies with movie document joined in
            topMovies: [
              { $group: { _id: "$show.movie", bookings: { $sum: 1 } } },
              { $sort: { bookings: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: "movies",
                  localField: "_id",
                  foreignField: "_id",
                  as: "movie",
                },
              },
              { $unwind: "$movie" },
            ],
            // Tickets sold per movie (all movies, sorted descending)
            ticketsPerMovie: [
              {
                $group: {
                  _id: "$show.movie",
                  ticketsSold: { $sum: { $size: "$bookedSeats" } },
                },
              },
              {
                $lookup: {
                  from: "movies",
                  localField: "_id",
                  foreignField: "_id",
                  as: "movie",
                },
              },
              { $unwind: "$movie" },
              { $sort: { ticketsSold: -1 } },
            ],
          },
        },
      ]);

      const totalUsers = await User.countDocuments();

      return {
        success: true,
        salesPerDay: facet.salesPerDay,
        topMovies: facet.topMovies,
        bookingsPerHour: facet.bookingsPerHour,
        ticketsPerMovie: facet.ticketsPerMovie,
        totalUsers,
      };
    });

    // TTL is 35 min — 5-min buffer over the 30-min cron interval so the key
    // never expires between two runs and leaves the endpoint with a cold cache.
    await redis.set("admin:analytics", JSON.stringify(payload), "EX", 35 * 60);
    logger.info("Analytics pre-computed and cached");
    return { message: "Analytics refreshed" };
  },
);

// ─── Recommendation Cache Pre-warming ────────────────────────────────────────

// Rebuilds a user's recommendation cache after payment is confirmed so the next
// page load hits a warm cache instead of running 6+ DB queries live.
// Triggered by the Stripe webhook (app/user.recommendation.refresh).
const refreshUserRecommendations = inngest.createFunction(
  { id: "refresh-user-recommendations", retries: 2 },
  { event: "app/user.recommendation.refresh" },
  async ({ event, step }) => {
    const { userId } = event.data;

    await step.run("rebuild-recommendation-cache", async () => {
      const now = new Date().toISOString();

      // Fetch booking history and favourite movie IDs in parallel
      const [bookings, user] = await Promise.all([
        Booking.find({ user: userId }).populate({
          path: "show",
          populate: { path: "movie" },
        }),
        clerkClient.users.getUser(userId),
      ]);

      let favouriteMovies = [];
      if (user?.privateMetadata?.favourite?.length) {
        favouriteMovies = await Movie.find({
          _id: { $in: user.privateMetadata.favourite },
        });
      }

      // Score genres: bookings +1, favourites +2 (favourites carry more signal)
      const genreCount = {};
      bookings.forEach((b) => {
        (b.show?.movie?.genres || []).forEach(({ name }) => {
          genreCount[name] = (genreCount[name] || 0) + 1;
        });
      });
      favouriteMovies.forEach((m) => {
        (m.genres || []).forEach(({ name }) => {
          genreCount[name] = (genreCount[name] || 0) + 2;
        });
      });

      const topGenreNames = Object.entries(genreCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name]) => name);

      let recommended = [];
      if (topGenreNames.length) {
        const moviesInGenres = await Movie.find({
          "genres.name": { $in: topGenreNames },
        }).select("_id");
        const movieIds = moviesInGenres.map((m) => m._id.toString());
        const upcomingShows = await Show.find({
          movie: { $in: movieIds },
          showDateTime: { $gte: now },
        }).populate("movie");
        const availableIds = [
          ...new Set(upcomingShows.map((s) => s.movie._id.toString())),
        ];
        recommended = await Movie.find({ _id: { $in: availableIds } }).limit(10);
      } else {
        // Cold-start fallback: no history yet — recommend popular upcoming movies
        const upcomingShows = await Show.find({
          showDateTime: { $gte: now },
        }).populate("movie");
        const availableIds = [
          ...new Set(upcomingShows.map((s) => s.movie._id.toString())),
        ];
        recommended = await Movie.find({ _id: { $in: availableIds } })
          .sort({ popularity: -1 })
          .limit(10);
      }

      const payload = { success: true, recommended };
      await redis.set(
        `recommendations:${userId}`,
        JSON.stringify(payload),
        "EX",
        15 * 60,
      );
    });

    logger.info({ userId }, "Recommendation cache pre-warmed");
    return { refreshed: true };
  },
);

// ─── Exports ─────────────────────────────────────────────────────────────────

export const functions = [
  // User sync
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdate,
  // Booking lifecycle
  releaseSeatsAndDeleteBooking,
  // Emails
  sendBookingComfirmationEmail,
  sendShowReminders,
  sendNewShowNotifications,
  // Movie release fan-out (replaces synchronous notifyUsers() loop)
  notifyMovieReleased,
  // Background analytics pre-computation (every 30 min cron)
  preComputeAnalytics,
  // Recommendation cache pre-warming (after payment confirmed)
  refreshUserRecommendations,
];
