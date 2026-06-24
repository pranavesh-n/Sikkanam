import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_me";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { uid, email, name, avatar } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "Missing required user login details (uid or email)" });
  }

  try {
    // Generate stateless JWT
    const token = jwt.sign(
      { id: uid, email, name, avatar },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Serialize JWT token into a secure HttpOnly cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

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
