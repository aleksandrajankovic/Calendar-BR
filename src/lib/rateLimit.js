// src/lib/rateLimit.js
// In-memory rate limiter — sufficient for a single Docker instance.
// For multi-instance deploy, replace with @upstash/ratelimit + Redis.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Map<ip, { count: number, resetAt: number }>
const store = new Map();

// Periodic cleanup of expired entries (every 10 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store) {
    if (now >= entry.resetAt) store.delete(ip);
  }
}, 10 * 60 * 1000);

export function checkRateLimit(ip) {
  const now = Date.now();
  const entry = store.get(ip);

  if (entry && now < entry.resetAt && entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip) {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearAttempts(ip) {
  store.delete(ip);
}
