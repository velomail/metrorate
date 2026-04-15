/**
 * POST /api/verify-license
 *
 * Verifies a MetroRate license token server-side using HMAC-SHA256.
 * The token format is:  base64url(payload).<HMAC-SHA256 hex>
 * where payload is a JSON string: { "email": "...", "plan": "lifetime", "exp": <unix-ts> }
 *
 * Environment variable required (set in Vercel dashboard — never in code):
 *   LICENSE_HMAC_SECRET — a strong random string used to sign tokens
 *
 * Security properties:
 *   - Rate-limited to 10 requests/minute per IP (via simple in-memory sliding window)
 *   - CORS restricted to the app's own origin
 *   - Returns only { valid: boolean } — never leaks why verification failed
 *   - Input length capped before any processing
 *   - Token includes expiry so stolen tokens expire
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, timingSafeEqual } from "crypto";

// ── Rate limiter (in-memory sliding window, resets on cold start) ─────────────
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const ipLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  ipLog.set(ip, hits);
  return hits.length > RATE_LIMIT;
}

// ── HMAC verification ─────────────────────────────────────────────────────────
function verifyToken(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, receivedSig] = parts;

  const expectedSig = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    const a = Buffer.from(receivedSig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  // Decode payload and check expiry
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as { exp?: number; plan?: string };

    if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
      return false; // Token expired
    }
    if (payload.plan !== "lifetime") {
      return false; // Unrecognised plan
    }
    return true;
  } catch {
    return false;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false });
  }

  // CORS — allow only your own app domain (set APP_ORIGIN in Vercel env vars)
  const allowedOrigin = process.env.APP_ORIGIN ?? "https://metrorate.vercel.app";
  const requestOrigin = req.headers.origin ?? "";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (requestOrigin !== allowedOrigin) {
    return res.status(403).json({ valid: false });
  }

  // Rate limiting
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim() ??
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ valid: false });
  }

  // Input validation — cap token length before processing
  const { token } = req.body as { token?: unknown };
  if (typeof token !== "string" || token.length > 2048) {
    return res.status(400).json({ valid: false });
  }

  // Verify
  const secret = process.env.LICENSE_HMAC_SECRET;
  if (!secret) {
    // Server misconfiguration — fail closed
    return res.status(500).json({ valid: false });
  }

  const valid = verifyToken(token, secret);
  return res.status(200).json({ valid });
}
