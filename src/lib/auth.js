// src/lib/auth.js
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";

const SESSION_DURATION = 60 * 60 * 8; // 8 hours

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return new TextEncoder().encode(s);
}

// ── Token revocation (in-memory, single Docker instance) ──────────────────
// Map<jti, expiresAtMs>
const revokedTokens = new Map();

function pruneRevoked() {
  const now = Date.now();
  for (const [jti, exp] of revokedTokens) {
    if (exp < now) revokedTokens.delete(jti);
  }
}

export function revokeToken(jti, expiresAt) {
  revokedTokens.set(jti, expiresAt * 1000); // exp is Unix seconds
  pruneRevoked();
}
// ──────────────────────────────────────────────────────────────────────────

export async function signToken(payload) {
  const jti = randomUUID();
  return new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.jti && revokedTokens.has(payload.jti)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Used in API routes (Node.js runtime)
export async function getAdminFromRequest(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_auth=([^;]+)/);
  if (!match) return null;
  return verifyToken(match[1]);
}

// Decode without verification (for logout — we need jti and exp)
export function decodeTokenUnsafe(token) {
  try {
    const [, payloadB64] = token.split(".");
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function makeSessionCookie(token) {
  const isProd = process.env.NODE_ENV === "production";
  return [
    `admin_auth=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DURATION}`,
    isProd ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

export function makeDeleteCookie() {
  const isProd = process.env.NODE_ENV === "production";
  return [
    "admin_auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict",
    isProd ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}
