import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import Chatrouter from "./routes/chatRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import upcomingRoutes from "./routes/upcomingRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";

const app = express();
const port = process.env.PORT;

await connectDB();

// stripe webhooks routes
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);
const allowedOrigins = [
  "http://localhost:5173",
  "https://myshow-eight.vercel.app",
];

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("server is live!");
});
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api", Chatrouter);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/upcoming", upcomingRoutes);
app.use("/api/agent", agentRoutes);

app.listen(port, () =>
  console.log(`server listening at http://localhost:${port}`)
);
