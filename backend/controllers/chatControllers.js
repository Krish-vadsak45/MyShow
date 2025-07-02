import axios from "axios";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";

export const geminiChatAboutDatabase = async (req, res) => {
  const { message } = req.body;
  console.log("User message:", message);

  let movieResults = [];
  let showResults = [];
  let userResults = [];
  let bookingResults = [];

  try {
    const now = new Date().toISOString();
    movieResults = await Movie.find({});
    showResults = await Show.find({
      showDateTime: { $gte: now },
    }).populate("movie");
    userResults = await User.find({});
    bookingResults = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        match: { showDateTime: { $gte: now } },
        populate: { path: "movie" },
      });
    bookingResults = bookingResults.filter((b) => b.show);
  } catch (err) {
    console.error("DB fetch error:", err.message || err);
    return res.status(500).json({ reply: "Database fetch error." });
  }

  // ✅ Helper: Safe to-string
  const safeString = (val) =>
    typeof val === "string" ? val : JSON.stringify(val);

  // ✅ Build Context
  let context = "";

  if (movieResults.length) {
    context += `Movies:\n${movieResults
      .map(
        (m) =>
          `Title: ${m.title}, Genre: ${m.genres}, Rating: ${m.vote_average}`
      )
      .join("\n")}\n\n`;
  }

  if (showResults.length) {
    context += `Shows:\n${showResults
      .map((s) => {
        const movieTitle = s.movie?.title || "Unknown Movie";
        return `Movie: ${movieTitle}, Date: ${s.showDateTime}`;
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
        return `User: ${user}, Movie: ${movie}, Date: ${date}, Seats: ${b.bookedSeats.join(
          ", "
        )}`;
      })
      .join("\n")}\n\n`;
  }
  // console.log(context);
  if (!context.trim()) context = "No relevant data found in the database.";

  // ✅ Final Prompt
  const prompt = `
                You are a helpful assistant for a movie booking website.
                Answer ONLY based on the following database context. If the answer is not in the data, find relative information and try to answer the question. If you are unsure, say "I don't know".

                Database:
                ${context}

                User asked: "${message}"

                Reply:
                `.trim();

  console.log(prompt);

  // ✅ Gemini API Call with fallback
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
      console.warn("Gemini overloaded (503).");
      return res.status(503).json({
        reply: "Gemini is currently overloaded. Please try again shortly. 🔁",
      });
    }

    console.error("Gemini error:", err.response?.data || err.message);
    res.status(500).json({ reply: "Something went wrong with Gemini." });
  }
};

// export const geminiChatAboutDatabase = async (req, res) => {
//   const { message } = req.body;
//   console.log(message);

//   // 1. Search your collections for relevant info
//   // (You can improve this with semantic search or more advanced logic)
//   let movieResults = [];
//   let showResults = [];
//   let userResults = [];
//   let bookingResults = [];

//   try {
//     movieResults = await Movie.find({});
//     showResults = await Show.find({}).populate("movie");
//     userResults = await User.find({});
//     bookingResults = await Booking.find({})
//       .populate("user")
//       .populate({ path: "show", populate: { path: "movie" } });
//   } catch (err) {
//     console.log("DB fetch error:", err.message || err);
//     return res.status(500).json({ reply: "Database error." });
//   }

//   // 2. Build a context string for Gemini
//   let context = "";
//   if (movieResults.length)
//     context += `Movies:\n${movieResults
//       .map((m) => `Title: ${m.title}, Genre: ${m.genre}, Rating: ${m.rating}`)
//       .join("\n")}\n`;
//   if (showResults.length)
//     context += `Shows:\n${showResults
//       .map(
//         (s) =>
//           `Movie: ${s.movie}, Date: ${s.showDateTime}, Theater: ${s.theater}`
//       )
//       .join("\n")}\n`;
//   if (userResults.length)
//     context += `Users:\n${userResults
//       .map((u) => `Name: ${u.name}, Email: ${u.email}`)
//       .join("\n")}\n`;
//   if (bookingResults.length)
//     context += `Bookings:\n${bookingResults
//       .map((b) => `User: ${b.user}, Show: ${b.show}, Seats: ${b.bookedSeats}`)
//       .join("\n")}\n`;

//   console.log("hii", context);
//   if (!context) context = "No relevant data found in the database.";
//   console.log(context);

//   // 3. Compose prompt for Gemini
//   const prompt = `
// You are a helpful assistant. Answer the user's question using ONLY the following database information. If the answer is not in the data, say "I don't know".

// Database info:
// ${context}

// User question: ${message}
// Assistant:
//   `;

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
//       geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
//       "Sorry, I couldn't get a response.";
//     res.json({ reply });
//   } catch (err) {
//     console.log("Gemini error:", err.response?.data || err.message || err);
//     res.status(500).json({ reply: "Sorry, I couldn't get a response." });
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
