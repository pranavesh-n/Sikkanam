import { signToken, createSessionCookie, verifyRequestOrigin } from "../utils/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Enforce CSRF verification for login requests
  if (!verifyRequestOrigin(req)) {
    return res.status(403).json({ error: "Forbidden: CSRF check failed." });
  }

  const { uid, email, name, avatar } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "Missing required user login details (uid or email)" });
  }

  try {
    // Generate stateless JWT payload
    const token = signToken({ id: uid, email, name, avatar }, "7d");

    // Serialize JWT token into a secure HttpOnly cookie
    const cookie = createSessionCookie(token);
    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      success: true,
      user: {
        _id: uid,
        id: uid,
        email,
        name: name || email.split("@")[0],
        avatar,
      }
    });
  } catch (error) {
    console.error("Login endpoint error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
