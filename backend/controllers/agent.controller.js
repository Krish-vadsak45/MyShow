import llm from "../config/groq.confing.js";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicStructuredTool, DynamicTool } from "@langchain/core/tools";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import z from "zod";
import Booking from "../models/booking.model.js";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";
import stripe from "stripe";
import { inngest } from "../inngest/index.js";

// Safely extract a JSON array (aggregation pipeline) from model output
function extractJsonArray(text) {
  if (!text || typeof text !== "string") return null;

  // strip code fences like ```json ... ```
  const noFences = text.replace(/```[\s\S]*?```/g, (m) =>
    m.replace(/```(json)?/gi, "").replace(/```/g, ""),
  );

  const start = noFences.indexOf("[");
  const end = noFences.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;

  let jsonStr = noFences.slice(start, end + 1).trim();

  // normalize single quotes if needed
  if (jsonStr.includes("'") && !jsonStr.includes('"')) {
    jsonStr = jsonStr.replace(/'/g, '"');
  }
  // fix missing commas between objects
  jsonStr = jsonStr.replace(/\}\s*\{/g, "}, {");

  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const Agent = async (req, res) => {
  console.log("Agent called");
  try {
    console.log(req.body.message);
    const { message } = req.body;
    const userId = req.userId;
    console.log("Agent called 2");

    const userShowsQueryTool = new DynamicTool({
      name: "query_user_shows",
      description: `
    Build a MongoDB aggregation pipeline for the "shows" collection.
    Use $lookup to join with "bookings" (field: "show") and "movies" (field: "movie").
    Filter bookings by the current user: "user": "<USER_ID>".
    NOTE: "show" in bookings is a string, but "_id" in shows is an ObjectId. You may need $toObjectId.
    Example: "[{\"$lookup\":{\"from\":\"bookings\",\"localField\":\"_id\",\"foreignField\":\"show\",\"as\":\"userBookings\"}},{\"$unwind\":\"$userBookings\"},{\"$match\":{\"userBookings.user\":\"<USER_ID>\"}},{\"$lookup\":{\"from\":\"movies\",\"localField\":\"movie\",\"foreignField\":\"_id\",\"as\":\"movieInfo\"}},{\"$unwind\":\"$movieInfo\"},{\"$project\":{\"_id\":0,\"showDateTime\":1,\"movieTitle\":\"$movieInfo.title\",\"movieGenre\":\"$movieInfo.genres\",\"rating\":\"$movieInfo.vote_average\"}}]"
  `,
      schema: z.string(),
      func: async (pipelineString) => {
        try {
          const pipeline = extractJsonArray(pipelineString) ?? [];
          const now = new Date();
          const pStr = JSON.stringify(pipeline)
            .replace(/"<USER_ID>"/g, `"${userId}"`)
            .replace(/"<CURRENT_TIME_ISO>"/g, `"${now.toISOString()}"`);
          const result = await Show.aggregate(JSON.parse(pStr)).exec();
          return JSON.stringify(result);
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });

    const availableShowsTool = new DynamicTool({
      name: "query_available_shows",
      description: `
    Find currently available or upcoming shows. THIS IS YOUR PRIMARY TOOL for "what's playing" or searching for shows by movie title.
    Build a MongoDB aggregation pipeline for the "shows" collection.
    Use $lookup to join with the "movies" collection (field: "movie").
    Filter by showDateTime >= <CURRENT_TIME_ISO> to ensure they are current.
    You can also filter by movie title using regex in a $match stage AFTER the $lookup.
    Return specific movie info (genres, overview, rating, runtime) and show details (showDateTime, showPrice, _id, occupiedSeats).
    Placeholders: <CURRENT_TIME_ISO>.
    Example for searching by title: "[{\"$match\":{\"showDateTime\":{\"$gte\":\"<CURRENT_TIME_ISO>\"}}},{\"$lookup\":{\"from\":\"movies\",\"localField\":\"movie\",\"foreignField\":\"_id\",\"as\":\"movieInfo\"}},{\"$unwind\":\"$movieInfo\"},{\"$match\":{\"movieInfo.title\":{\"$regex\":\"Avatar\",\"$options\":\"i\"}}},{\"$project\":{\"_id\":1,\"showDateTime\":1,\"movieTitle\":\"$movieInfo.title\",\"occupiedSeats\":1}}]"
  `,
      schema: z.string(),
      func: async (pipelineString) => {
        try {
          const pipeline = extractJsonArray(pipelineString) ?? [];
          const now = new Date();
          const pStr = JSON.stringify(pipeline).replace(
            /"<CURRENT_TIME_ISO>"/g,
            `"${now.toISOString()}"`,
          );
          const result = await Show.aggregate(JSON.parse(pStr)).exec();
          return JSON.stringify(result);
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });

    const popularMoviesTool = new DynamicTool({
      name: "query_popular_movies",
      description: `
    Find most popular and currently available movies based on booking counts.
    Build a MongoDB aggregation pipeline for the "bookings" collection.
    Use $lookup to join with "shows" (field: "show") and "movies".
    Priority: Return movies that have upcoming shows (showDateTime >= <CURRENT_TIME_ISO>).
    Example: "[{\"$addFields\":{\"showId\":{\"$toObjectId\":\"$show\"}}},{\"$lookup\":{\"from\":\"shows\",\"localField\":\"showId\",\"foreignField\":\"_id\",\"as\":\"showInfo\"}},{\"$unwind\":\"$showInfo\"},{\"$match\":{\"showInfo.showDateTime\":{\"$gte\":\"<CURRENT_TIME_ISO>\"}}},{\"$lookup\":{\"from\":\"movies\",\"localField\":\"showInfo.movie\",\"foreignField\":\"_id\",\"as\":\"movieInfo\"}},{\"$unwind\":\"$movieInfo\"},{\"$group\":{\"_id\":\"$movieInfo.title\",\"count\":{\"$sum\":1},\"genres\":{\"$first\":\"$movieInfo.genres\"},\"rating\":{\"$first\":\"$movieInfo.vote_average\"}}},{\"$sort\":{\"count\":-1}},{\"$limit\":5}]"
  `,
      schema: z.string(),
      func: async (pipelineString) => {
        try {
          const pipeline = extractJsonArray(pipelineString) ?? [];
          const now = new Date();
          const pStr = JSON.stringify(pipeline).replace(
            /"<CURRENT_TIME_ISO>"/g,
            `"${now.toISOString()}"`,
          );
          const result = await Booking.aggregate(JSON.parse(pStr)).exec();
          return JSON.stringify(result);
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });

    const seatAvailabilityTool = new DynamicTool({
      name: "check_seat_availability",
      description: `
    Calculate available seats for a specific show ID. 
    Total seats are 90 (Rows A-J, Columns 1-9).
    Input: The ID of the show.
    Returns: A list of available seat names.
  `,
      schema: z.string(),
      func: async (showId) => {
        try {
          const show = await Show.findById(showId.replace(/"/g, ""));
          if (!show) return "Show not found";

          const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
          const available = [];
          for (const row of rows) {
            for (let i = 1; i <= 9; i++) {
              const seatId = `${row}${i}`;
              if (!show.occupiedSeats || !show.occupiedSeats[seatId]) {
                available.push(seatId);
              }
            }
          }
          return JSON.stringify({
            availableCount: available.length,
            availableSeats: available,
            recommendation:
              "Seats in rows E, F, G (4-6) are generally best for viewing.",
          });
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });

    const queryMoviesTool = new DynamicTool({
      name: "query_movies_details",
      description: `
    Search for movies by title or properties in the "movies" collection.
    Use this if you can't find shows for a movie to confirm if the movie exists at all.
    Build a MongoDB aggregation pipeline for the "movies" collection.
    Example: "[{\"$match\":{\"title\":{\"$regex\":\"Avatar\",\"$options\":\"i\"}}}]"
  `,
      schema: z.string(),
      func: async (pipelineString) => {
        try {
          const pipeline = extractJsonArray(pipelineString) ?? [];
          const result = await Movie.aggregate(pipeline).exec();
          return JSON.stringify(result);
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });

    const upcomingMoviesTool = new DynamicTool({
      name: "query_upcoming_movies",
      description: `
      Find movies that are coming soon but not yet in regular rotation.
      Build a MongoDB aggregation pipeline (JSON string) for the "upcomingmovies" collection.
      Fields available: "tmdbId", "title", "posterPath", "releaseDate".
      Example: "[{\"$sort\":{\"releaseDate\":1}},{\"$limit\":5}]"
    `,
      schema: z.string(),
      func: async (pipelineString) => {
        try {
          const pipeline = extractJsonArray(pipelineString) ?? [];
          // We need to import the UpcomingMovie model dynamically or ensure it's imported at the top.
          // Assuming it's imported as UpcomingMovie
          const UpcomingMovie = (
            await import("../models/upcomingMovie.model.js")
          ).default;
          const result = await UpcomingMovie.aggregate(pipeline).exec();
          return JSON.stringify(result);
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });

    const bookTicketTool = new DynamicStructuredTool({
      name: "book_ticket",
      description: `
    Book specific seats for a show. 
    Use this ONLY when the user explicitly asks to book or buy tickets for specific seats (e.g., "Book E4 for Avatar").
    Input MUST be a JSON string with "showId" (string) and "seats" (array of strings).
    Example: '{{ "showId": "65123abc...", "seats": ["A1", "A2"] }}'
    Returns the payment URL if successful, or an error message if seats are taken.
  `,
      schema: z.object({
        showId: z.string(),
        seats: z.array(z.string()),
      }),
      func: async ({ showId, seats }) => {
        try {
          if (!showId || !seats || seats.length === 0) {
            return "Error: Missing showId or seats.";
          }

          // 1. Atomic Locking (Temporary Booking)
          // Ensure all seats are free and claim them in one atomic operation
          const query = { _id: showId };
          seats.forEach((seat) => {
            query[`occupiedSeats.${seat}`] = { $exists: false };
          });

          const update = { $set: {} };
          seats.forEach((seat) => {
            update.$set[`occupiedSeats.${seat}`] = userId;
          });

          const show = await Show.findOneAndUpdate(query, update, {
            new: true,
          }).populate("movie");

          if (!show) {
            // Check if show exists or if it's just a seat conflict
            const showExists = await Show.findById(showId);
            if (!showExists) return "Error: Show not found.";

            const occupied = showExists.occupiedSeats || {};
            const taken = seats.filter((s) => occupied[s]);
            return `Error: Seats ${taken.join(", ")} were just booked by someone else. Please try other seats.`;
          }

          // 2. Create Booking Record
          const amount = show.showPrice * seats.length;
          const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: amount,
            bookedSeats: seats,
          });

          // 3. Create Stripe Session
          const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
          // Use origin from req headers or fallback
          const origin = req.headers.origin || "http://localhost:5173";

          const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/mybookings`,
            cancel_url: `${origin}/mybookings`,
            line_items: [
              {
                price_data: {
                  currency: "usd", // Adjust currency if needed
                  product_data: {
                    name: `${show.movie.title} - Seats: ${seats.join(", ")}`,
                  },
                  unit_amount: Math.floor(amount * 100), // in cents
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            metadata: {
              bookingId: booking._id.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 mins
          });

          booking.paymentLink = session.url;
          await booking.save();

          // 5. Schedule payment check (Inngest)
          await inngest.send({
            name: "app/checkpayment",
            data: {
              bookingId: booking._id.toString(),
            },
          });

          return `Booking successful for seats ${seats.join(", ")}! Please make payment here: ${session.url}`;
        } catch (error) {
          console.error("Booking tool error:", error);
          return `Booking failed: ${error.message}`;
        }
      },
    });

    const tools = [
      userShowsQueryTool,
      availableShowsTool,
      popularMoviesTool,
      seatAvailabilityTool,
      queryMoviesTool,
      upcomingMoviesTool,
      bookTicketTool,
    ];

    const SYSTEM_HINT = `
    The current user's id is "${userId}". 
    ALWAYS prioritize "query_available_shows" to see what is currently playing or to search for a movie show by name.
    If searching for a specific movie:
      1. Try "query_available_shows" to find showtimes.
      2. If no shows, try "query_movies_details" to get movie info.
      3. If still nothing, try "query_upcoming_movies".
    If checking seat availability, use "check_seat_availability" with the exact show ID.
    If the user explicitly asks to BOOK or BUY tickets for specific seats (e.g., "Book E4 for Avatar", "Buy tickets"):
      1. You MUST have the "showId" (from previous search context) and "seats" list.
      2. If missing showId or seats, ask user to clarify.
      3. Use "book_ticket" tool with JSON input: {{"showId": "...", "seats": ["E4"]}}.
      4. Return the payment link provided by the tool.
    If asked about "upcoming" or "notify" movies, use "query_upcoming_movies".
    Provide specific details: Genres, Ratings, Runtime, and Seat Recommendations (Rows E-G are best).
    Answer in 1-2 clear, helpful sentences. Avoid raw JSON output.
    `;
    console.log("Agent called 4");

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        [
          "You are MyShow's intelligent movie assistant. Help the user find shows, check details, and choose seats.",
          "Use the provided tools extensively. Do not guess.",
          "Tool inputs must be valid JSON strings (no code fences).",
          "For MongoDB aggregation tools, input MUST be an array pipeline like `[...]`.",
          "If no tool helps, you can answer generally about movies using your knowledge.",
          "Answer pleasantly and concisely.",
          SYSTEM_HINT,
        ].join(" "),
      ],
      ["placeholder", "{chat_history}"],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);
    console.log("Agent called 5");

    const agent = await createToolCallingAgent({ llm, tools, prompt });
    const executor = new AgentExecutor({ agent, tools });
    console.log("Agent called 6");

    // Limit message length to avoid context overflow
    const MAX_INPUT_LENGTH = 1000;
    const safeMessage =
      typeof message === "string" && message.length > MAX_INPUT_LENGTH
        ? message.slice(0, MAX_INPUT_LENGTH)
        : message;

    const chat_history = (req.body.history || []).map((m) => {
      if (m.role === "user") {
        return new HumanMessage(m.content);
      }
      return new AIMessage(m.content);
    });

    const result = await executor.invoke({
      input: safeMessage,
      chat_history: chat_history,
    });
    console.log("Agent called 7");
    console.log("Agent result:", result);

    // Try to parse the output as JSON, else fallback to plain output
    let answer = result.output;
    let formatted = null;
    try {
      const arr = JSON.parse(answer);
      if (Array.isArray(arr) && arr.length > 0) {
        // Format each show/movie/booking in a user-friendly way
        formatted = arr
          .map((item, idx) => {
            // Try to extract fields for both tools
            const title =
              item.movieTitle ||
              item.title ||
              item.movieInfo?.title ||
              item._id ||
              "(No title)";
            const showDateTime = item.showDateTime
              ? new Date(item.showDateTime).toLocaleString()
              : undefined;
            const genres = item.genres || item.movieGenre;
            const rating = item.rating || item.vote_average;
            const count = item.bookingCount || item.count;
            const availableSeats = item.availableCount;
            const recommendation = item.recommendation;
            const releaseDate = item.releaseDate
              ? new Date(item.releaseDate).toDateString()
              : undefined;

            const price =
              item.showPrice !== undefined ? `₹${item.showPrice}` : undefined;
            const bookedSeats = item.bookedSeats
              ? `Seats: ${item.bookedSeats.join(", ")}`
              : undefined;
            const bookingAmount =
              item.bookingAmount !== undefined
                ? `Booking Amount: ₹${item.bookingAmount}`
                : undefined;
            return [
              `Movie: ${title}`,
              genres
                ? `Genre: ${Array.isArray(genres) ? genres.join(", ") : genres}`
                : null,
              rating ? `Rating: ${rating}/10` : null,
              showDateTime ? `Show Time: ${showDateTime}` : null,
              releaseDate ? `Release: ${releaseDate}` : null,
              price,
              bookedSeats,
              bookingAmount,
              count ? `Bookings: ${count}` : null,
              availableSeats !== undefined
                ? `Free Seats: ${availableSeats}`
                : null,
              recommendation ? `Tip: ${recommendation}` : null,
            ]
              .filter(Boolean)
              .join(" | ");
          })
          .join("\n");
      }
    } catch {}

    // If the LLM output is a plain string (not JSON), try to prettify ISO dates and amounts in the text
    let prettified = formatted;
    if (!formatted && typeof answer === "string") {
      // Check for stripe link and ensure it's not messed up by prettifying
      // We will skip prettifying if it looks like a simple sentence response (which usually comes from book_ticket)
      if (answer.includes("stripe.com") || answer.includes("checkout")) {
        prettified = answer; // Keep it as is
      } else {
        // Replace ISO date/time with local date/time
        prettified = answer.replace(
          /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)/g,
          (iso) => {
            try {
              const d = new Date(iso);
              return d.toLocaleString();
            } catch {
              return iso;
            }
          },
        );
        // Replace amount patterns like 'amount: 250' or '₹250' with '₹250'
        prettified = prettified.replace(/amount:?\s*(\d+)/gi, "₹$1");
        prettified = prettified.replace(/\bINR\s*(\d+)/gi, "₹$1");
      }
    }

    return res.status(200).json({
      answer: prettified || answer,
    });
  } catch (err) {
    console.error("Agent error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export default Agent;
