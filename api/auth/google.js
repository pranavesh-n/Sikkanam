import { URLSearchParams } from "url";

export default async function handler(req, res) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  // Dynamically determine callback URL if not set in .env
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${protocol}://${host}/api/auth/callback`;

  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" ")
  };

  if (!options.client_id) {
    return res.status(500).json({ error: "GOOGLE_CLIENT_ID is not configured in environment variables." });
  }

  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
}
