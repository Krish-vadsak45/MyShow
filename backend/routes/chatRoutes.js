// In your backend (Node.js/Express)
import express from "express"; 
const Chatrouter = express.Router();
import {
  getMovies,
  getRecommendations,
  geminiChatAboutDatabase,
} from "../controllers/chatControllers.js";

Chatrouter.post("/chat", geminiChatAboutDatabase);
Chatrouter.get("/movies/recommendations", getRecommendations);

// Chatrouter.post("/chat", async (req, res) => {
//   const { message, userId } = req.body;
//   // Optionally fetch user bookings or TMDB data here

//   // Compose prompt for GPT-4
//   const prompt = `User: ${message}\nAssistant:`;

//   try {
//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-4",
//         messages: [{ role: "user", content: prompt }],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     res.json({ reply: response.data.choices[0].message.content });
//   } catch (err) {
//     res.status(500).json({ error: "OpenAI API error" });
//   }
// });

export default Chatrouter;
