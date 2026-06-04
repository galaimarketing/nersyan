/**
 * Server-side admin session helpers.
 *
 * Uses Web Crypto (globalThis.crypto.subtle) so the same code runs in both the
 * Edge middleware and Node.js route handlers. The session cookie holds an HMAC
 * signed with ADMIN_SESSION_SECRET — it cannot be forged from the browser, and
 * being HttpOnly it cannot be read or set by client JS (unlike the old
 * localStorage "admin-auth" flag, which anyone could set via DevTools).
 */

export const ADMIN_COOKIE_NAME = "admin_session";

// 12 hours. Cookie also expires client-side via maxAge.
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

const SESSION_PAYLOAD = "nersyan-admin-v1";

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(sig);
}

/** Constant-time-ish string comparison (avoids early-exit timing leaks). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** The token value stored in the session cookie after a successful login. */
export async function createSessionToken(secret: string): Promise<string> {
  return hmacHex(SESSION_PAYLOAD, secret);
}

/** True when the supplied cookie token was issued by this server. */
export async function verifySessionToken(
  token: string | undefined | null,
  secret: string | undefined | null
): Promise<boolean> {
  if (!token || !secret) return false;
  const expected = await createSessionToken(secret);
  return safeEqual(token, expected);
}

/** Reads a single cookie value out of a raw "Cookie" header. */
function readCookie(cookieHeader: string, name: string): string | undefined {
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/**
 * Guard for admin-only API route handlers. Returns true only when the request
 * carries a valid admin session cookie. Use to reject unauthenticated writes:
 *   if (!(await isAuthedRequest(req))) return new Response(null, { status: 401 });
 */
export async function isAuthedRequest(req: Request): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = readCookie(req.headers.get("cookie") ?? "", ADMIN_COOKIE_NAME);
  return verifySessionToken(token, secret);
}
