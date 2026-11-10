import test from "node:test";
import assert from "node:assert/strict";
import {
  createBreaker,
  tmdbBreaker,
  stripeBreaker,
  groqBreaker,
  clerkBreaker,
  emailBreaker,
} from "../config/circuitBreakers.js";

test("Circuit Breaker - Factory and State Machine", async (t) => {
  await t.test("executes successfully in CLOSED state", async () => {
    let executionCount = 0;
    const breaker = createBreaker(async (val) => {
      executionCount++;
      return val * 2;
    }, {
      name: "TEST_SUCCESS",
      timeout: 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 500,
      volumeThreshold: 2,
    });

    const result = await breaker.fire(5);
    assert.equal(result, 10);
    assert.equal(executionCount, 1);
    assert.equal(breaker.opened, false);
    breaker.shutdown();
  });

  await t.test("trips to OPEN state when failures cross volume & error threshold", async () => {
    let attemptCount = 0;
    const breaker = createBreaker(async () => {
      attemptCount++;
      throw new Error("Downstream service failure");
    }, {
      name: "TEST_TRIP",
      timeout: 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 500,
      volumeThreshold: 2,
    });

    // Fire failures to meet volume threshold and trip breaker
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.fire();
      } catch (err) {
        // Expected failure
      }
    }

    assert.equal(breaker.opened, true, "Circuit breaker should be OPEN");

    // Next call should be REJECTED immediately without executing the action
    const attemptsBeforeReject = attemptCount;
    let rejected = false;
    try {
      await breaker.fire();
    } catch (err) {
      rejected = true;
      assert.equal(err.code, "EOPENBREAKER");
    }

    assert.equal(rejected, true, "Should reject with EOPENBREAKER");
    assert.equal(attemptCount, attemptsBeforeReject, "Action should NOT have been invoked when breaker is OPEN");
    breaker.shutdown();
  });

  await t.test("recovers from OPEN to HALF-OPEN then CLOSED after resetTimeout", async () => {
    let fail = true;
    const breaker = createBreaker(async () => {
      if (fail) throw new Error("Service down");
      return "recovered";
    }, {
      name: "TEST_RECOVER",
      timeout: 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 200, // 200ms cooldown
      volumeThreshold: 2,
    });

    // Trip the breaker
    for (let i = 0; i < 3; i++) {
      try { await breaker.fire(); } catch {}
    }
    assert.equal(breaker.opened, true);

    // Wait for resetTimeout to expire
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Service recovers
    fail = false;
    const probeResult = await breaker.fire();
    assert.equal(probeResult, "recovered");
    assert.equal(breaker.opened, false, "Breaker should have closed after successful probe");
    breaker.shutdown();
  });

  await t.test("enforces timeout and fast-fails slow calls", async () => {
    const breaker = createBreaker(async () => {
      // Simulate hanging call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return "done";
    }, {
      name: "TEST_TIMEOUT",
      timeout: 100, // 100ms timeout
      errorThresholdPercentage: 50,
      resetTimeout: 500,
      volumeThreshold: 1,
    });

    let timedOut = false;
    try {
      await breaker.fire();
    } catch (err) {
      timedOut = true;
      assert.equal(err.code, "ETIMEDOUT");
    }
    assert.equal(timedOut, true, "Should throw ETIMEDOUT when call exceeds timeout");
    breaker.shutdown();
  });
});

test("Priority 1: Core External Circuit Breakers Configuration", async (t) => {
  await t.test("tmdbBreaker is configured with correct resilience thresholds", () => {
    assert.equal(tmdbBreaker.name, "TMDB_API");
    assert.equal(tmdbBreaker.options.timeout, 5000);
    assert.equal(tmdbBreaker.options.errorThresholdPercentage, 50);
    assert.equal(tmdbBreaker.options.resetTimeout, 20000);
  });

  await t.test("stripeBreaker is configured with correct resilience thresholds", () => {
    assert.equal(stripeBreaker.name, "STRIPE_API");
    assert.equal(stripeBreaker.options.timeout, 6000);
    assert.equal(stripeBreaker.options.errorThresholdPercentage, 50);
    assert.equal(stripeBreaker.options.resetTimeout, 20000);
  });

  await t.test("groqBreaker is configured with LLM-appropriate timeout", () => {
    assert.equal(groqBreaker.name, "GROQ_LLM");
    assert.equal(groqBreaker.options.timeout, 15000);
    assert.equal(groqBreaker.options.errorThresholdPercentage, 50);
    assert.equal(groqBreaker.options.resetTimeout, 25000);
  });
});

test("Priority 2: Clerk Identity Circuit Breaker Configuration", async (t) => {
  await t.test("clerkBreaker is configured with fast-fail thresholds", () => {
    assert.equal(clerkBreaker.name, "CLERK_API");
    assert.equal(clerkBreaker.options.timeout, 4000);
    assert.equal(clerkBreaker.options.errorThresholdPercentage, 50);
    assert.equal(clerkBreaker.options.resetTimeout, 20000);
  });
});

test("Priority 3: Email & Worker Circuit Breaker Configuration", async (t) => {
  await t.test("emailBreaker is configured with SMTP thresholds", () => {
    assert.equal(emailBreaker.name, "BREVO_SMTP");
    assert.equal(emailBreaker.options.timeout, 8000);
    assert.equal(emailBreaker.options.errorThresholdPercentage, 50);
    assert.equal(emailBreaker.options.resetTimeout, 30000);
  });
});
