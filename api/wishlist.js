import { connectToDatabase } from "./utils/db.js";
import { Wishlist } from "./utils/models.js";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_me";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid session." });
  }

  try {
    await connectToDatabase();

    if (req.method === "GET") {
      const items = await Wishlist.find({ userId });
      const destinationIds = items.map(item => item.destinationId);
      return res.status(200).json({ wishlist: destinationIds });
    }

    if (req.method === "POST") {
      const { destinationId } = req.body;
      if (!destinationId) {
        return res.status(400).json({ error: "Missing destinationId" });
      }

      const existing = await Wishlist.findOne({ userId, destinationId });
      if (existing) {
        return res.status(200).json({ success: true, message: "Already in wishlist" });
      }

      const item = new Wishlist({ userId, destinationId });
      await item.save();
      return res.status(201).json({ success: true, message: "Added to wishlist" });
    }

    if (req.method === "DELETE") {
      const destinationId = req.query.destinationId || req.body.destinationId;
      if (!destinationId) {
        return res.status(400).json({ error: "Missing destinationId" });
      }

      await Wishlist.deleteOne({ userId, destinationId });
      return res.status(200).json({ success: true, message: "Removed from wishlist" });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Wishlist API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
