import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import pinoHttp from "pino-http";
import "dotenv/config";
import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import upcomingRoutes from "./routes/upcomingRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT;

await connectDB();

// Enterprise Redis Rate Limiters
const globalLimiter = rateLimiter("global", 200, 15 * 60);
const authLimiter = rateLimiter("auth", 20, 15 * 60);
const bookingLimiter = rateLimiter("booking", 15, 5 * 60);

// stripe webhooks routes
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks,
);
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://myshow-eight.vercel.app",
]);

app.use(compression());
app.use(pinoHttp({ logger }));
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(clerkMiddleware());
app.use("/api/", globalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/booking/create", bookingLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/", (req, res) => {
  res.send("server is live!");
});
app.get("/api/health", (req, res) => res.status(200).send("OK"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/upcoming", upcomingRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/auth", authRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  logger.error({ err, method: req.method, path: req.path }, "Unhandled error");
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

app.listen(port, () =>
  logger.info(`server listening at http://localhost:${port}`),
);
