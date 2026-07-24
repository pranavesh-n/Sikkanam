import jwt from "jsonwebtoken";
import { parse, serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn("WARNING: JWT_SECRET environment variable is missing in production!");
}

const SECRET_KEY = JWT_SECRET || "fallback_development_only_secret_key_sikkanam_2026";
const COOKIE_NAME = "token";

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}

export function verifyRequestOrigin(req) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  const host = req.headers.host;
  const origin = req.headers.origin;
  const referer = req.headers.referer;

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

  console.warn(`CSRF alert: host (${host}) matches neither Origin (${origin}) nor Referer (${referer}). Request blocked.`);
  return false;
}

export function getSessionFromReq(req) {
  if (!verifyRequestOrigin(req)) {
    return null;
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

export function createSessionCookie(token, maxAgeSeconds = 60 * 60 * 24 * 7) {
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeSeconds,
    path: "/",
  });
}

export function createClearSessionCookie() {
  return serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
}
