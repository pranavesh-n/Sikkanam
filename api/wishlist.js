import { connectToDatabase } from "./_utils/db.js";
import { Wishlist } from "./_utils/models.js";
import { getSessionFromReq } from "./_utils/auth.js";

export default async function handler(req, res) {
  const decoded = getSessionFromReq(req);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  const userId = decoded.id;

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
