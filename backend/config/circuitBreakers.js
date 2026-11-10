import CircuitBreaker from "opossum";
import logger from "./logger.js";

/**
 * Factory to create and attach standard telemetry/logging to an Opossum circuit breaker.
 * @param {Function} actionFn - Async function to guard.
 * @param {Object} options - Opossum options.
 * @returns {CircuitBreaker}
 */
export const createBreaker = (actionFn, options = {}) => {
  const name = options.name || "default";

  const defaultOptions = {
    timeout: 5000, // 5s timeout default
    errorThresholdPercentage: 50, // trip if 50% fail
    resetTimeout: 20000, // wait 20s in OPEN before trying HALF-OPEN
    volumeThreshold: 3, // minimum 3 requests before evaluating error threshold
    rollingCountTimeout: 10000, // 10s rolling statistics window
    ...options,
  };

  const breaker = new CircuitBreaker(actionFn, defaultOptions);

  breaker.on("open", () => {
    logger.warn({ breaker: name }, `[CIRCUIT BREAKER: OPEN] -> ${name} tripped! Outbound calls will fast-fail.`);
  });

  breaker.on("close", () => {
    logger.info({ breaker: name }, `[CIRCUIT BREAKER: CLOSED] -> ${name} healthy. Normal operation restored.`);
  });

  breaker.on("halfOpen", () => {
    logger.info({ breaker: name }, `[CIRCUIT BREAKER: HALF-OPEN] -> ${name} testing canary request.`);
  });

  breaker.on("timeout", () => {
    logger.warn({ breaker: name }, `[CIRCUIT BREAKER: TIMEOUT] -> ${name} call exceeded ${defaultOptions.timeout}ms threshold.`);
  });

  breaker.on("reject", () => {
    logger.warn({ breaker: name }, `[CIRCUIT BREAKER: REJECT] -> ${name} call rejected immediately while OPEN.`);
  });

  breaker.on("failure", (err) => {
    logger.warn({ breaker: name, err: err?.message }, `[CIRCUIT BREAKER: FAILURE] -> ${name} call failed.`);
  });

  return breaker;
};

// ─── Priority 1 Breakers ───────────────────────────────────────────────────────

/**
 * TMDB Circuit Breaker for now-playing, upcoming, and show details.
 */
export const tmdbBreaker = createBreaker(
  async (fn, ...args) => await fn(...args),
  {
    name: "TMDB_API",
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 20000,
    volumeThreshold: 3,
  }
);

/**
 * Stripe Circuit Breaker for checkout sessions.
 */
export const stripeBreaker = createBreaker(
  async (fn, ...args) => await fn(...args),
  {
    name: "STRIPE_API",
    timeout: 6000,
    errorThresholdPercentage: 50,
    resetTimeout: 20000,
    volumeThreshold: 3,
  }
);

/**
 * Groq LLM Circuit Breaker for AI chatbot reasoning.
 */
export const groqBreaker = createBreaker(
  async (fn, ...args) => await fn(...args),
  {
    name: "GROQ_LLM",
    timeout: 15000, // 15s to allow for LLM prompt processing
    errorThresholdPercentage: 50,
    resetTimeout: 25000,
    volumeThreshold: 2,
  }
);

// ─── Priority 2 Breaker ────────────────────────────────────────────────────────

/**
 * Clerk API Circuit Breaker for user retrieval and metadata update.
 */
export const clerkBreaker = createBreaker(
  async (fn, ...args) => await fn(...args),
  {
    name: "CLERK_API",
    timeout: 4000,
    errorThresholdPercentage: 50,
    resetTimeout: 20000,
    volumeThreshold: 3,
  }
);

// ─── Priority 3 Breaker ────────────────────────────────────────────────────────

/**
 * Brevo SMTP Circuit Breaker for transactional and reminder emails.
 */
export const emailBreaker = createBreaker(
  async (fn, ...args) => await fn(...args),
  {
    name: "BREVO_SMTP",
    timeout: 8000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    volumeThreshold: 3,
  }
);

export default {
  createBreaker,
  tmdbBreaker,
  stripeBreaker,
  groqBreaker,
  clerkBreaker,
  emailBreaker,
};

