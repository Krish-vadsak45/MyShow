import axios from "axios";
import UpcomingMovie from "../models/upcomingMovie.model.js";
import sendEmail from "../config/nodeMailer.js";
import redis from "../config/redis.js";

const UPCOMING_CACHE_KEY = "upcoming:movies";
const UPCOMING_CACHE_TTL = 60 * 60; // 1 hour

export const fetchUpcoming = async (_req, res) => {
  // Serve from Redis cache if still fresh
  const cached = await redis.get(UPCOMING_CACHE_KEY);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() + 1);
  const to = new Date(today);
  to.setDate(to.getDate() + 10);

  const url = `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${from
    .toISOString()
    .slice(0, 10)}&primary_release_date.lte=${to.toISOString().slice(0, 10)}`;

  const [{ data }, dbMovies] = await Promise.all([
    axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        accept: "application/json",
      },
    }),
    UpcomingMovie.find(
      { releaseDate: { $gte: from, $lte: to } },
      { tmdbId: 1, notifyUsers: 1 }
    ),
  ]);

  const notifyMap = new Map(dbMovies.map((m) => [m.tmdbId, m.notifyUsers.length]));

  if (data.results.length > 0) {
    await UpcomingMovie.bulkWrite(
      data.results.map((m) => ({
        updateOne: {
          filter: { tmdbId: m.id },
          update: {
            $setOnInsert: {
              tmdbId: m.id,
              title: m.title,
              posterPath: m.poster_path,
              releaseDate: m.release_date,
            },
          },
          upsert: true,
        },
      }))
    );
  }

  const result = data.results.map((m) => ({
    tmdbId: m.id,
    title: m.title,
    posterPath: m.poster_path,
    releaseDate: m.release_date,
    notifyCount: notifyMap.get(m.id) ?? 0,
  }));

  await redis.set(UPCOMING_CACHE_KEY, JSON.stringify(result), "EX", UPCOMING_CACHE_TTL);

  res.json(result);
};

export const toggleNotify = async (req, res) => {
  const { tmdbId } = req.body;
  const userId = req.user.id;
  const movie = await UpcomingMovie.findOne({ tmdbId });
  if (!movie) return res.status(404).json({ error: "Movie not found" });

  const idx = movie.notifyUsers.findIndex((u) => u.toString() === userId);
  let notify;
  if (idx === -1) {
    movie.notifyUsers.push(userId);
    notify = true;
  } else {
    movie.notifyUsers.splice(idx, 1);
    notify = false;
  }
  await movie.save();

  // Bust upcoming cache so notify counts update
  await redis.del(UPCOMING_CACHE_KEY);

  res.json({ notify });
};

export const getUserNotified = async (req, res) => {
  const userId = req.user.id;
  const movies = await UpcomingMovie.find({ notifyUsers: userId });
  const notifiedIds = movies.map((m) => m.tmdbId);
  res.json({ notified: notifiedIds });
};

export const adminList = async (_req, res) => {
  const today = new Date();
  const movies = await UpcomingMovie.find({
    notifyUsers: { $exists: true, $not: { $size: 0 } },
    releaseDate: { $gte: today },
  });
  res.json(movies);
};

export const notifyUsers = async (tmdbId) => {
  const movie = await UpcomingMovie.findOne({ tmdbId }).populate("notifyUsers");
  if (!movie || movie.notified) return;
  for (const user of movie.notifyUsers) {
    await sendEmail({
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

      <p>
        Click the button below to choose seats and complete your booking
        before they sell out:
      </p>

      <p style="text-align: center; margin: 24px 0;">
        <a
          href="${bookingUrl}"
          style="
            background: #F84565;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;"
        >
          Book Tickets
        </a>
      </p>

      <p>See you at the movies!</p>
      <p>Thanks for using MyShow<br/>– The MyShow Team</p>

      <hr style="border:none;border-top:1px solid #eaeaea;margin:32px 0;"/>
      <small style="color:#888;">
        You're receiving this email because you clicked "Notify Me" for
        "${movie.title}". If you'd like to stop these alerts,
        <a href="${unsubscribeUrl}">unsubscribe here</a>.
      </small>
      <p>Visit our website</p> <a href="https://myshow-eight.vercel.app/">MyShow</a> <p> For more details.</p>
    </div>
  `,
    });
  }
  movie.notified = true;
  await movie.save();
};

export default {
  fetchUpcoming,
  toggleNotify,
  adminList,
  notifyUsers,
  getUserNotified,
};
