import { createClearSessionCookie, verifyRequestOrigin } from "../utils/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Enforce CSRF verification for logout requests
  if (!verifyRequestOrigin(req)) {
    return res.status(403).json({ error: "Forbidden: CSRF check failed." });
  }

  const cookie = createClearSessionCookie();

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ success: true });
}
