import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_me";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return res.status(200).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({
      loggedIn: true,
      user: {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0],
        avatar: decoded.avatar,
      },
    });
  } catch (error) {
    return res.status(200).json({ loggedIn: false });
  }
}
