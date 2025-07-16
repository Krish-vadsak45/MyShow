import axios from "axios";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";

export const geminiChatAboutDatabase = async (req, res) => {
  const { message } = req.body;

  let movieResults = [];
  let showResults = [];
  let userResults = [];
  let bookingResults = [];

  try {
    const now = new Date().toISOString();

    // Fetch all movies
    movieResults = await Movie.find({}).lean();

    // Fetch shows with future datetime, populated with movie details
    showResults = await Show.find({ showDateTime: { $gte: now } })
      .populate({ path: "movie", select: "title genres vote_average" })
      .lean();

    // Fetch users
    userResults = await User.find({}).select("name email").lean();

    // Fetch bookings with populated user and show (which also populates movie)
    bookingResults = await Booking.find({})
      .populate("user", "name email")
      .populate({
        path: "show",
        match: { showDateTime: { $gte: now } },
        populate: { path: "movie", select: "title" },
      })
      .lean();

    // Filter out bookings where the show didn't match the $gte filter
    bookingResults = bookingResults.filter((b) => b.show);
  } catch (err) {
    console.error("DB fetch error:", err.message || err);
    return res.status(500).json({ reply: "Database fetch error." });
  }

  // Build prompt context
  let context = "";

  if (movieResults.length) {
    context += `Movies:\n${movieResults
      .map(
        (m) =>
          `Title: ${m.title}, Genre: ${
            Array.isArray(m.genres)
              ? m.genres.map((g) => g.name).join(", ")
              : "Unknown"
          }, Rating: ${m.vote_average}`
      )
      .join("\n")}\n\n`;
  }

  if (showResults.length) {
    context += `Shows:\n${showResults
      .map((s) => {
        const movieTitle = s.movie?.title || "Unknown Movie";
        return `Movie: ${movieTitle}, DateTime: ${s.showDateTime}`;
      })
      .join("\n")}\n\n`;
  }

  if (userResults.length) {
    context += `Users:\n${userResults
      .map((u) => `Name: ${u.name}, Email: ${u.email}`)
      .join("\n")}\n\n`;
  }

  if (bookingResults.length) {
    context += `Bookings:\n${bookingResults
      .map((b) => {
        const user = b.user?.name || "Unknown User";
        const movie = b.show?.movie?.title || "Unknown Movie";
        const date = b.show?.showDateTime || "Unknown Date";
        const seats = Array.isArray(b.bookedSeats)
          ? b.bookedSeats.join(", ")
          : "None";
        return `User: ${user}, Movie: ${movie}, Date: ${date}, Seats: ${seats}`;
      })
      .join("\n")}\n\n`;
  }
  console.log(context);
  if (!context.trim()) context = "No relevant data found in the database.";

  // Build prompt
  const prompt = `
You are a helpful assistant for a movie booking website.

Answer ONLY using the information in the database context below.
If the answer is not in the data, try to search as per your knowledge and try to connect with my database information and respond accordingly.

You can answer:
- What movies are available?
- Suggest me a horror movie
- When is my next booking?
- What shows are available tonight?
- Who are the registered users?
- How many seats have I booked for Avatar?
- Recommend a good rated movie
- What genres are available?

Database:
${context}

User asked: "${message}"

Reply:
`.trim();

  // Debug: log what we're sending to Gemini
  // console.log("=== Prompt Sent to Gemini ===");
  // console.log(prompt);

  // Send to Gemini
  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const reply =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Sorry, I couldn't get a response from Gemini.";

    res.json({ reply });
  } catch (err) {
    const status = err.response?.status;
    if (status === 503) {
      console.warn("Gemini is overloaded (503)");
      return res.status(503).json({
        reply: "Gemini is currently overloaded. Please try again shortly. 🔁",
      });
    }

    console.error("Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ reply: "Something went wrong with Gemini." });
  }
};

// import axios from "axios";
// import Movie from "../models/movie.model.js";
// import Show from "../models/show.model.js";
// import User from "../models/user.model.js";
// import Booking from "../models/booking.model.js";

// export const geminiChatAboutDatabase = async (req, res) => {
//   const { message } = req.body;

//   let movieResults = [];
//   let showResults = [];
//   let userResults = [];
//   let bookingResults = [];

//   try {
//     const now = new Date().toISOString();

//     // Fetch users
//     userResults = await User.find({}).select("name email").lean();

//     // Fetch shows with future datetime and populated movie
//     showResults = await Show.find({ showDateTime: { $gte: now } })
//       .populate({ path: "movie", select: "title genres vote_average" })
//       .lean();

//     // Extract unique movieIds from shows
//     const movieIdsFromShows = showResults
//       .map((show) => show.movie?._id)
//       .filter(Boolean);

//     // Fetch movies that are part of shows
//     movieResults = await Movie.find({ _id: { $in: movieIdsFromShows } }).lean();

//     // Fetch bookings with populated user and show + show.movie
//     bookingResults = await Booking.find({})
//       .populate("user", "name email")
//       .populate({
//         path: "show",
//         match: { showDateTime: { $gte: now } },
//         populate: { path: "movie", select: "title" },
//       })
//       .lean();

//     // Filter out bookings where show is missing
//     bookingResults = bookingResults.filter((b) => b.show);
//   } catch (err) {
//     console.error("DB fetch error:", err.message || err);
//     return res.status(500).json({ reply: "Database fetch error." });
//   }

//   // Build prompt context
//   let context = "";

//   if (movieResults.length) {
//     context += `Movies:\n${movieResults
//       .map(
//         (m) =>
//           `Title: ${m.title}, Genre: ${
//             Array.isArray(m.genres)
//               ? m.genres.map((g) => g.name).join(", ")
//               : "Unknown"
//           }, Rating: ${m.vote_average}`
//       )
//       .join("\n")}\n\n`;
//   }

//   if (showResults.length) {
//     context += `Shows:\n${showResults
//       .map((s) => {
//         const movieTitle = s.movie?.title || "Unknown Movie";
//         return `Movie: ${movieTitle}, DateTime: ${s.showDateTime}`;
//       })
//       .join("\n")}\n\n`;
//   }

//   if (userResults.length) {
//     context += `Users:\n${userResults
//       .map((u) => `Name: ${u.name}, Email: ${u.email}`)
//       .join("\n")}\n\n`;
//   }

//   if (bookingResults.length) {
//     context += `Bookings:\n${bookingResults
//       .map((b) => {
//         const user = b.user?.name || "Unknown User";
//         const movie = b.show?.movie?.title || "Unknown Movie";
//         const date = b.show?.showDateTime || "Unknown Date";
//         const seats = Array.isArray(b.bookedSeats)
//           ? b.bookedSeats.join(", ")
//           : "None";
//         return `User: ${user}, Movie: ${movie}, Date: ${date}, Seats: ${seats}`;
//       })
//       .join("\n")}\n\n`;
//   }

//   if (!context.trim()) context = "No relevant data found in the database.";

//   // Build prompt
//   const prompt = `
// You are a helpful assistant for a movie booking website.

// Answer ONLY using the information in the database context below.try to search as per your knowledge and try to connect with my database information and respond accordingly. If you're unsure, say \"I don't know\

// You can answer:
// - What movies are available?
// - Suggest me a horror movie
// - When is my next booking?
// - What shows are available tonight?
// - Who are the registered users?
// - How many seats have I booked for Avatar?
// - Recommend a good rated movie
// - What genres are available?

// Database:
// ${context}

// User asked: "${message}"

// Reply:
// `.trim();

//   console.log("=== Prompt Sent to Gemini ===");
//   console.log(prompt);

//   try {
//     const geminiRes = await axios.post(
//       `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             parts: [{ text: prompt }],
//           },
//         ],
//       }
//     );

//     const reply =
//       geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
//       "Sorry, I couldn't get a response from Gemini.";

//     res.json({ reply });
//   } catch (err) {
//     const status = err.response?.status;
//     if (status === 503) {
//       console.warn("Gemini is overloaded (503)");
//       return res.status(503).json({
//         reply: "Gemini is currently overloaded. Please try again shortly. 🔁",
//       });
//     }

//     console.error("Gemini API error:", err.response?.data || err.message);
//     res.status(500).json({ reply: "Something went wrong with Gemini." });
//   }
// };

export const getMovies = async (req, res) => {
  const { message } = req.body;

  console.log(
    "tmdb",
    process.env.TMDB_API_KEY,
    "OPENAI",
    process.env.OPENAI_API_KEY
  );

  // Example: fetch trending movies from TMDB if user asks for trending
  let tmdbData = "";
  try {
    if (/popular/i.test(message)) {
      const tmdbRes = await axios.get(
        "https://api.themoviedb.org/3/movie/popular",
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }
      );
      console.log("res", tmdbRes);
      const movies = tmdbRes.data.results
        .slice(0, 3)
        .map((m) => m.title)
        .join(", ");
      console.log("movi", movies);
      tmdbData = `Popular movies: ${movies}`;
    }
  } catch (err) {
    console.log("OpenAI/TMDB error:", err.response?.data || err.message || err);
  }
  console.log("1");
  // Compose prompt for OpenAI
  console.log("hii", tmdbData);
  // Compose prompt for Gemini
  const prompt = `User: ${message}${
    tmdbData ? "\n" + tmdbData : ""
  }\nAssistant:`;
  console.log(prompt);

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );
    // Gemini's response structure
    const reply =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't get a response.";
    res.json({ reply });
  } catch (err) {
    console.log("OpenAI error:", err.response?.data || err.message || err);
    res.status(500).json({ reply: "Sorry, I couldn't get a response." });
  }
};

export const getRecommendations = async (req, res) => {
  const { genre } = req.query;
  try {
    const tmdbRes = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${genre}`
    );
    res.json(tmdbRes.data.results);
  } catch (err) {
    res.status(500).json({ error: "TMDB error" });
  }
};
