import axios from "axios";
import UpcomingMovie from "../models/upcomingMovie.model.js";
import User from "../models/user.model.js";
import sendEmail from "../config/nodeMailer.js";

export const fetchUpcoming = async (req, res) => {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() + 1);
  const to = new Date(today);
  to.setDate(to.getDate() + 10);

  const url = `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${from
    .toISOString()
    .slice(0, 10)}&primary_release_date.lte=${to.toISOString().slice(0, 10)}`;
  // console.log("Fetching upcoming movies from TMDB:", url);
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      accept: "application/json",
    },
  });

  // const { data } = await axios.get(url);
  // console.log("Upcoming movies fetched:", data.results);
  // Upsert movies in DB for notification tracking
  for (const m of data.results) {
    await UpcomingMovie.updateOne(
      { tmdbId: m.id },
      {
        $setOnInsert: {
          tmdbId: m.id,
          title: m.title,
          posterPath: m.poster_path,
          releaseDate: m.release_date,
        },
      },
      { upsert: true }
    );
  }
  // Return with notifyCount
  const movies = await UpcomingMovie.find({
    releaseDate: { $gte: from, $lte: to },
  });
  // console.log("Movies with notifyCount:", movies);
  res.json(
    data.results.map((m) => {
      const dbMovie = movies.find((x) => x.tmdbId === m.id);
      return {
        tmdbId: m.id,
        title: m.title,
        posterPath: m.poster_path,
        releaseDate: m.release_date,
        notifyCount: dbMovie ? dbMovie.notifyUsers.length : 0,
      };
    })
  );
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
  res.json({ notify });
};

// Get all tmdbIds the current user is notified for
export const getUserNotified = async (req, res) => {
  const userId = req.user.id;
  // console.log("User ID:", userId);
  const movies = await UpcomingMovie.find({ notifyUsers: userId });
  const notifiedIds = movies.map((m) => m.tmdbId);
  res.json({ notified: notifiedIds });
};

export const adminList = async (req, res) => {
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
      // to: user.email,
      // subject: "Now Playing!",
      // body: `The movie "${movie.title}" is now playing!`,
      to: user.email, // e.g. "krish@example.com"
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
        <strong>First Show:</strong><br/>
        ${new Date(firstShow.showDateTime).toLocaleDateString("en-US", {
          timeZone: "Asia/Kolkata",
        })},
        ${new Date(firstShow.showDateTime).toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
        })}

        ${
          firstShow.screenName
            ? `<br/><strong>Screen:</strong> ${firstShow.screenName}`
            : ""
        }
      </p>

      <p>
        Click the button below to choose seats and complete your booking
        before they sell out:
      </p>

      <p style="text-align: center; margin: 24px 0;">
        <a
          href="${bookingUrl}"                /* e.g. https://myshow.com/booking/${
        firstShow._id
      } */
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

      <p>Thanks for using MyShow<br/>– The MyShow Team</p>

      <hr style="border:none;border-top:1px solid #eaeaea;margin:32px 0;"/>
      <small style="color:#888;">
        You’re receiving this email because you clicked “Notify Me” for
        "${movie.title}". If you’d like to stop these alerts,
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
