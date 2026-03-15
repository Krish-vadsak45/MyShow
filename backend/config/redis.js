import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null; // give up after 3 failed retries
    return Math.min(times * 200, 2000);
  },
  enableOfflineQueue: false,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));

export default redis;
