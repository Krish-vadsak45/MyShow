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

/**
 * Enterprise getOrSetCache (Mutex) pattern to prevent Cache Stampede
 * @param {string} key - The cache key to search for or set.
 * @param {function} fetchFn - The asynchronous function that fetches fresh data.
 * @param {number} ttl - The time-to-live in seconds for the cache.
 * @returns {Promise<any>} The data (from cache or newly fetched).
 */
export const getOrSetCache = async (key, fetchFn, ttl) => {
  try {
    const cached = await redis.get(key);
    if (cached === "NF") {
      logger.info({ key }, "Cache HIT (Negativ - NF)");
      return null;
    }
    if (cached) return JSON.parse(cached);

    const lockKey = `lock:${key}`;
    const acquired = await redis.set(lockKey, "locked", "EX", 10, "NX");

    if (acquired) {
      try {
        const freshData = await fetchFn();

        if (
          !freshData ||
          (Array.isArray(freshData) && freshData.length === 0)
        ) {
          // Attack Mitigation: Cache "Not Found" for 30s to prevent DB hammering
          await redis.set(key, "NF", "EX", 30);
          return null;
        }

        await redis.set(key, JSON.stringify(freshData), "EX", ttl);
        return freshData;
      } finally {
        await redis.del(lockKey);
      }
    } else {
      // Small randomized wait to avoid tight polling loops across multiple nodes
      await new Promise((resolve) =>
        setTimeout(resolve, 50 + Math.random() * 150),
      );
      return getOrSetCache(key, fetchFn, ttl);
    }
  } catch (err) {
    logger.error({ err, key }, "Redis getOrSetCache error");
    // Fallback directly to fetch function if Redis is down
    return fetchFn();
  }
};

export default redis;
