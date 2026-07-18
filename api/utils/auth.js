import jwt from "jsonwebtoken";
import { parse, serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn("WARNING: JWT_SECRET environment variable is missing in production!");
}

const SECRET_KEY = JWT_SECRET || "fallback_development_only_secret_key_sikkanam_2026";
const COOKIE_NAME = "token";

/**
 * Signs a JWT token for a given payload
 */
export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

/**
 * Verifies a JWT token string
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Verifies that the request's Origin or Referer matches the Host to prevent CSRF attacks.
 * Returns true if valid (or if the method is safe like GET), false otherwise.
 */
export function verifyRequestOrigin(req) {
  // Safe methods do not require CSRF checks
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  const host = req.headers.host;
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // 1. Try to verify using the Origin header
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) {
        return true;
      }
    } catch (e) {
      console.warn("Invalid Origin header URL:", origin);
    }
  }

  // 2. Fallback to Referer header if Origin is not present or parsing failed
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === host) {
        return true;
      }
    } catch (e) {
      console.warn("Invalid Referer header URL:", referer);
    }
  }

  // 3. Block request if neither Origin nor Referer matches host
  console.warn(`CSRF alert: host (${host}) matches neither Origin (${origin}) nor Referer (${referer}). Request blocked.`);
  return false;
}

/**
 * Extracts and verifies the user session token from request cookies
 */
export function getSessionFromReq(req) {
  // Enforce CSRF verification for mutating requests
  if (!verifyRequestOrigin(req)) {
    return null;
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Creates an HttpOnly, Secure, SameSite cookie string for setting session
 */
export function createSessionCookie(token, maxAgeSeconds = 60 * 60 * 24 * 7) {
  return serialize(COOKIE_NAME, token, {
    httpOnly: true, // Prevents XSS script access to the session cookie
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production", // Transmitted over HTTPS only in production
    sameSite: "lax", // Protects against CSRF attacks
    maxAge: maxAgeSeconds,
    path: "/",
  });
}

/**
 * Creates an expired cookie string to clear session on logout
 */
export function createClearSessionCookie() {
  return serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
}
