import { connectToDatabase } from "./_utils/db.js";
import { Feedback } from "./_utils/models.js";
import { getSessionFromReq } from "./_utils/auth.js";
import { serverConfig } from "./_utils/config.js";

/**
 * Feedback API Handler
 * Security & Isolation:
 * - User A can ONLY access, view, and manage User A's feedback queries and history.
 * - User A CANNOT access, view, or delete User B's data under any circumstance.
 * - Viewing (GET) and deleting (DELETE) feedback query history strictly requires an authenticated session.
 */
export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const decoded = getSessionFromReq(req);

    // 1. GET: Fetch user's feedback query history from MongoDB (Strictly Authenticated)
    if (req.method === "GET") {
      if (!decoded) {
        return res.status(401).json({ error: "Unauthorized: Please log in to view your feedback history." });
      }

      const userFilter = {
        $or: [
          { userId: decoded.id },
          ...(decoded.email ? [{ userId: decoded.email }, { userEmail: decoded.email }] : [])
        ]
      };

      const items = await Feedback.find(userFilter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ feedbacks: items });
    }

    // 2. POST: Store new feedback query in MongoDB
    if (req.method === "POST") {
      const { type, message, appVersion, deviceInfo } = req.body || {};

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Feedback message cannot be empty." });
      }

      // If user is authenticated, strictly bind to their authenticated UID & Gmail
      const userId = decoded?.id || "anonymous_guest";
      const userEmail = decoded?.email || "anonymous@sikkanam.com";

      const newFeedback = new Feedback({
        userId,
        userEmail,
        type: type || "other",
        message: message.trim().slice(0, 2000),
        appVersion: appVersion || serverConfig.appVersion,
        deviceInfo: deviceInfo || "",
        status: "received",
        createdAt: new Date(),
      });

      const saved = await newFeedback.save();
      return res.status(201).json({ success: true, feedback: saved });
    }

    // 3. DELETE: Remove a feedback query from MongoDB (Strictly Authenticated & Owned)
    if (req.method === "DELETE") {
      if (!decoded) {
        return res.status(401).json({ error: "Unauthorized: Please log in to delete your feedback." });
      }

      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: "Missing feedback ID to delete." });
      }

      const userFilter = {
        _id: id,
        $or: [
          { userId: decoded.id },
          ...(decoded.email ? [{ userId: decoded.email }, { userEmail: decoded.email }] : [])
        ]
      };

      const deleted = await Feedback.findOneAndDelete(userFilter);
      if (!deleted) {
        return res.status(404).json({ error: "Feedback query not found or unauthorized." });
      }

      return res.status(200).json({ success: true, message: "Feedback query deleted successfully." });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Feedback API Error:", error);
    return res.status(500).json({ error: "Failed to connect to feedback database." });
  }
}
