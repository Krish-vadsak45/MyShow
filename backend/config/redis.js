import Redis from "ioredis";
import logger from "./logger.js";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy: (times) => {
    return Math.min(times * 200, 2000);
  },
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
  commandTimeout: 5000,
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error({ err }, "Redis error"));

/**
 * Global helper to log cache hit/miss ratio
 */
export const getCachedData = async (key) => {
  try {
    const data = await redis.get(key);
    if (data) {
      logger.info({ key }, "Cache HIT (Redis)");
      return JSON.parse(data);
    }
    logger.info({ key }, "Cache MISS (Redis)");
    return null;
  } catch (err) {
    logger.error({ err, key }, "Redis GET error");
    return null;
  }
};

export default redis;
