import llm from "../config/groq.confing.js";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";
import z from "zod";
import Booking from "../models/booking.model.js";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";

// Safely extract a JSON array (aggregation pipeline) from model output
function extractJsonArray(text) {
  if (!text || typeof text !== "string") return null;

  // strip code fences like ```json ... ```
  const noFences = text.replace(/```[\s\S]*?```/g, (m) =>
    m.replace(/```(json)?/gi, "").replace(/```/g, "")
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
    const { userId } = (await req.auth()) || {};
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("Agent called 2");

    // Build tool per-request so it can capture userId
    const userBookingsQueryTool = new DynamicTool({
      name: "query_user_bookings",
      description: `
        Build a MongoDB aggregation pipeline for the "bookings" collection.
        Return ONLY a valid JSON array (no prose, no comments, no code fences).
        Use double quotes for all keys/strings.
        Fields: "user" (string), "show" (string), "amount" (number), "bookedSeats" (array), "isPaid" (boolean), "paymentLink" (string), "createdAt", "updatedAt".
        Examples:
        - Total spent and total tickets:
          [
            {"$match":{"isPaid":true}},
            {"$group":{"_id":null,"totalSpent":{"$sum":"$amount"},"totalTickets":{"$sum":{"$size":"$bookedSeats"}}}}
          ]
        - Last 5 paid bookings:
          [
            {"$match":{"isPaid":true}},
            {"$sort":{"createdAt":-1}},
            {"$limit":5},
            {"$project":{"_id":0,"amount":1,"bookedSeats":1,"createdAt":1}}
          ]
      `,
      schema: z
        .string()
        .describe("A JSON string that is an aggregation pipeline array."),
      func: async (pipelineString) => {
        try {
          const pipeline =
            extractJsonArray(pipelineString) ??
            (() => {
              throw new Error("Invalid pipeline JSON. Provide a JSON array.");
            })();

          // Always scope to the current user
          const scopedPipeline = [{ $match: { user: userId } }, ...pipeline];

          const result = await Booking.aggregate(scopedPipeline).exec();
          return JSON.stringify(result);
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });
    console.log("Agent called 3");

    // Tool to get movie IDs the user has booked
    const userMovieQueryTool = new DynamicTool({
      name: "query_user_movies",
      description: `
        Build a MongoDB aggregation pipeline for the "Movie" collection.
        Return ONLY a valid JSON array (no prose, no comments, no code fences).
        Use double quotes for all keys/strings.
        Fields: "_id" (string), "title" (string), "overview" (string), "poster_path" (string), "backdrop_path" (string), "release_date" (string), "original_language" (string), "tagline" (string), "genres" (array), "cast" (array), "crew" (array), "vote_average" (number), "runtime" (number), "trailerKey" (string).
        Examples:
        - Get details for specific movie title "Inception":
          [
            {"$match":{"title":"Inception"}},
          ]
      `,
      schema: z
        .string()
        .describe("A JSON string that is an aggregation pipeline array."),
      func: async (pipelineString) => {
        try {
          const pipeline =
            extractJsonArray(pipelineString) ??
            (() => {
              throw new Error("Invalid pipeline JSON. Provide a JSON array.");
            })();

          // Always scope to the current user
          const scopedPipeline = [...pipeline];

          const result = await Movie.aggregate(scopedPipeline).exec();
          return JSON.stringify(result);
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });

    // Tool to get shows the user has bookings for
    const userShowsQueryTool = new DynamicTool({
      name: "query_user_shows",
      description: `
        Build a MongoDB aggregation pipeline for the "Shows" collection.
        Return ONLY a valid JSON array (no prose, no comments, no code fences).
        Use double quotes for all keys/strings.
        use this collection as now playing or currently showing movies.
        Fields: "_id" (string), "movie" (string), "showDateTime" (string), "showPrice" (number), "occupiedSeats" (object).
        Examples:
        - Get shows for a specific movie ID "movie123":
          [
            {"$match":{"movie":"movie123"}},
          ]
      `,
      schema: z
        .string()
        .describe("A JSON string that is an aggregation pipeline array."),
      func: async (pipelineString) => {
        try {
          const pipeline =
            extractJsonArray(pipelineString) ??
            (() => {
              throw new Error("Invalid pipeline JSON. Provide a JSON array.");
            })();

          // Always scope to the current user
          const scopedPipeline = [{ $match: { user: userId } }, ...pipeline];

          const result = await Show.aggregate(scopedPipeline).exec();
          return JSON.stringify(result);
        } catch (error) {
          return `ERROR: ${error.message}`;
        }
      },
    });

    const tools = [
      userBookingsQueryTool,
      userMovieQueryTool,
      userShowsQueryTool,
    ];

    const SYSTEM_HINT = `The current user's id is "${userId}". If the question uses "I", "me", or "my", scope results to this user. Use $lookup in the aggregation pipeline to join bookings to shows and movies when needed. Use the tool to run an aggregation and then answer in one clear sentence.`;
    console.log("Agent called 4");

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        [
          "You are an expert at creating MongoDB aggregation pipelines for the bookings collection.",
          "You MUST use the provided tool to answer.",
          "Return only the final answer in a clear sentence.",
          "Tool input must be a valid JSON array (no code fences, no comments).",
          SYSTEM_HINT,
        ].join(" "),
      ],
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

    // Optionally, limit agent_scratchpad (if used by executor)
    // If your agent framework allows, pass only the last N steps or none
    // Here, we just pass input, but you can add: { input: safeMessage, agent_scratchpad: lastFew } if needed
    const result = await executor.invoke({ input: safeMessage });
    console.log("Agent called 7");
    console.log("Agent result:", result);

    return res.status(200).json({ answer: result.output });
  } catch (err) {
    console.error("Agent error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export default Agent;
