import redis from "../config/redis.js";
import logger from "../config/logger.js";

/**
 * Enterprise-grade Rate Limiter using Redis
 * @param {string} prefix - Unique prefix for the rate limit (e.g., 'auth', 'api')
 * @param {number} limit - Max requests allowed
 * @param {number} windowSeconds - Time window in seconds
 */
export const rateLimiter = (prefix, limit, windowSeconds) => {
  return async (req, res, next) => {
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const key = `ratelimit:${prefix}:${ip}`;

    try {
      const current = await redis.get(key);

      if (current && parseInt(current) >= limit) {
        logger.warn({ ip, prefix }, "Rate limit exceeded");
        return res.status(429).json({
          success: false,
          message: "Too many requests, please try again later.",
        });
      }

      if (!current) {
        await redis.set(key, 1, "EX", windowSeconds);
      } else {
        await redis.incr(key);
      }

      next();
    } catch (err) {
      logger.error({ err }, "Rate limiter error");
      // Fail open in case Redis is down (Enterprise preference depends on security needs)
      next();
    }
  };
};
