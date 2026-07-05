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
 * Extracts and verifies the user session token from request cookies
 */
export function getSessionFromReq(req) {
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
