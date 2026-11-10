import { clerkClient, verifyToken } from "@clerk/express";
import logger from "../config/logger.js";
import { clerkBreaker } from "../config/circuitBreakers.js";

const getVerifiedUserId = async (req) => {
  const token = req.cookies?.__auth_token;
  if (!token) return null;
  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
    clockSkewInMs: 3 * 60 * 1000, // tolerate up to 3 min clock drift
  });
  return payload?.sub ?? null;
};

export const protectAdmin = async (req, res, next) => {
  try {
    const userId = await getVerifiedUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let user;
    try {
      user = await clerkBreaker.fire(async () => {
        return await clerkClient.users.getUser(userId);
      });
    } catch (breakerErr) {
      logger.warn(
        { err: breakerErr?.message, userId },
        "Clerk circuit breaker tripped in protectAdmin — fast-failing securely",
      );
      return res.status(503).json({
        success: false,
        isAdmin: false,
        message: "Identity provider temporarily unavailable",
      });
    }

    if (user.privateMetadata?.role !== "admin") {
      return res.json({
        success: false,
        isAdmin: false,
        message: "unauthorized",
      });
    }
    next();
  } catch (error) {
    logger.error({ err: error }, "Auth middleware error");
    res.status(401).json({ success: false, message: "not-authorized" });
  }
};

export const auth = async (req, res, next) => {
  try {
    const userId = await getVerifiedUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.userId = userId;

    try {
      req.user = await clerkBreaker.fire(async () => {
        return await clerkClient.users.getUser(userId);
      });
    } catch (breakerErr) {
      logger.warn(
        { err: breakerErr?.message, userId },
        "Clerk circuit breaker tripped in auth middleware — falling back to verified JWT identity",
      );
      // Fallback: token signature already verified by verifyToken, attach verified ID
      req.user = { id: userId, privateMetadata: {} };
    }

    next();
  } catch (error) {
    logger.error({ err: error }, "Auth middleware error");
    res.status(401).json({ success: false, message: "Not authorized" });
  }
};
