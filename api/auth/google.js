import { URLSearchParams } from "url";
import crypto from "crypto";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  // Dynamically determine callback URL if not set in .env
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${protocol}://${host}/api/auth/callback`;

  const state = crypto.randomBytes(16).toString("hex");
  const isSecure =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview";

  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    state,
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" ")
  };

  if (!options.client_id) {
    return res.status(500).json({ error: "GOOGLE_CLIENT_ID is not configured in environment variables." });
  }

  res.setHeader(
    "Set-Cookie",
    serialize("oauth_state", state, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    })
  );

  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
}
