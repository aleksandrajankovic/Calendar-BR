// src/lib/withRetry.js
// Retries a DB call on Neon cold-start errors (P1001/P1002).
// First request after inactivity wakes the database; retry succeeds.

const RETRYABLE = new Set(["P1001", "P1002"]);

export async function withRetry(fn, { retries = 3, delayMs = 1500 } = {}) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (RETRYABLE.has(e?.code) && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}
