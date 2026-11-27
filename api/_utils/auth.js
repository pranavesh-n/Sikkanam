import jwt from "jsonwebtoken";
import { parse, serialize } from "cookie";
import crypto from "crypto";
import { serverConfig } from "./config.js";

const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
const isSecureCookie =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production" ||
  process.env.VERCEL_ENV === "preview";

const JWT_SECRET = process.env.JWT_SECRET || serverConfig.jwtSecret;

if (!JWT_SECRET) {
  if (isProd) {
    throw new Error("FATAL: JWT_SECRET environment variable is missing in production!");
  }
  console.warn("WARNING: JWT_SECRET is missing; using deterministic dev-only fallback secret.");
}

const SECRET_KEY = JWT_SECRET || "sikkanam-dev-only-insecure-fallback-secret";
const COOKIE_NAME = "token";

/**
 * Returns the request Origin if it matches an allowed CORS origin, or "" otherwise.
 */
export function getAllowedCorsOrigin(req) {
  const origin = req?.headers?.origin || req?.headers?.Origin;
  if (!origin || typeof origin !== "string") return "";

  const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (extraOrigins.includes(origin)) return origin;

  try {
    const parsed = new URL(origin);
    if (parsed.protocol === "https:") {
      if (parsed.hostname === "sikkanam.vercel.app" || parsed.hostname.endsWith(".vercel.app")) {
        return origin;
      }
    }
    if (parsed.protocol === "http:") {
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return origin;
      }
    }
  } catch {
    return "";
  }

  return "";
}

/**
 * Computes a deterministic client device fingerprint based on User-Agent and client characteristics.
 * Used to cryptographically tie the session token to the issuing device, blocking session hijacking.
 */
export function getClientFingerprint(req) {
  if (!req) return "";
  const ua = req.headers?.["user-agent"] || "unknown_ua";
  const lang = req.headers?.["accept-language"] || "";
  return crypto.createHash("sha256").update(`${ua}|${lang.slice(0, 10)}`).digest("hex").slice(0, 16);
}

/**
 * Sign session token with anti-hijacking fingerprint binding.
 */
export function signToken(payload, expiresIn = "30d", req = null) {
  const fpt = req ? getClientFingerprint(req) : payload.fpt;
  return jwt.sign({ ...payload, ...(fpt ? { fpt } : {}) }, SECRET_KEY, { expiresIn });
}

/**
 * Verify session token and enforce anti-hijacking checks.
 */
export function verifyToken(token, req = null) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Anti-Session Hijacking: If token was bound to a client fingerprint, verify that current request matches
    if (req && decoded.fpt) {
      const currentFpt = getClientFingerprint(req);
      if (currentFpt && decoded.fpt !== currentFpt) {
        console.warn("Security Alert: Session hijacking attempt detected. Client fingerprint mismatch.");
        return null;
      }
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Origin and Referer verification for CSRF mitigation
 */
export function verifyRequestOrigin(req) {
  if (["GET", "HEAD", "OPTIONS"].includes(req?.method)) {
    return true;
  }

  const headers = req?.headers || {};
  const host = headers.host || headers.Host;
  const origin = headers.origin || headers.Origin;
  const referer = headers.referer || headers.Referer || headers.referrer;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === host || originUrl.hostname === (host ? host.split(":")[0] : "")) {
        return true;
      }
    } catch (e) {
      console.warn("Invalid Origin header URL:", origin);
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === host || refererUrl.hostname === (host ? host.split(":")[0] : "")) {
        return true;
      }
    } catch (e) {
      console.warn("Invalid Referer header URL:", referer);
    }
  }

  console.warn(`CSRF alert: host (${host}) matches neither Origin (${origin}) nor Referer (${referer}). Request blocked.`);
  return false;
}

/**
 * Extract and verify session from request cookies with hijacking protection
 */
export function getSessionFromReq(req) {
  if (!verifyRequestOrigin(req)) {
    return null;
  }

  const cookies = parse(req.headers?.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token, req);
}

export function createSessionCookie(token, maxAgeSeconds = 60 * 60 * 24 * 30) {
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    maxAge: maxAgeSeconds,
    path: "/",
  });
}

export function createClearSessionCookie() {
  return serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
}
