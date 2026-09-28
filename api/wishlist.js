import { connectToDatabase } from "./_utils/db.js";
import { Wishlist } from "./_utils/models.js";
import { getSessionFromReq } from "./_utils/auth.js";

/**
 * Wishlist API Handler
 * Architecture: ONLY `wishlists` and `feedbacks` reside in MongoDB.
 * Cross-device sync: Accessible by any device using the user's Google/Gmail account.
 */
export default async function handler(req, res) {
  const decoded = getSessionFromReq(req);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  const userId = decoded.id;
  const userEmail = decoded.email;
  const userFilter = userEmail ? { $or: [{ userId }, { userId: userEmail }] } : { userId };

  try {
    await connectToDatabase();

    if (req.method === "GET") {
      const items = await Wishlist.find(userFilter);
      const destinationIds = items.map(item => item.destinationId);
      return res.status(200).json({ wishlist: destinationIds });
    }

    if (req.method === "POST") {
      const { destinationId } = req.body;
      if (!destinationId) {
        return res.status(400).json({ error: "Missing destinationId" });
      }

      const existing = await Wishlist.findOne({ ...userFilter, destinationId });
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

      await Wishlist.deleteMany({ ...userFilter, destinationId });
      return res.status(200).json({ success: true, message: "Removed from wishlist" });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Wishlist API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
