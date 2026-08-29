import { connectToDatabase } from "./_utils/db.js";
import { Feedback } from "./_utils/models.js";
import { getSessionFromReq } from "./_utils/auth.js";

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const decoded = getSessionFromReq(req);
    // Use decoded authenticated userId if available, or fallback to an anonymous client identifier from header/cookie
    const clientHeader = req.headers["x-client-id"] || req.headers["user-agent"] || "anonymous_guest";
    const userId = decoded?.id || `anon_${Buffer.from(clientHeader).toString("base64").slice(0, 24)}`;
    const userEmail = decoded?.email || "anonymous@sikkanam.com";

    // 1. GET: Fetch user's feedback query history from MongoDB
    if (req.method === "GET") {
      const items = await Feedback.find({ userId }).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ feedbacks: items });
    }

    // 2. POST: Store new feedback query in MongoDB
    if (req.method === "POST") {
      const { type, message, appVersion, deviceInfo } = req.body || {};

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Feedback message cannot be empty." });
      }

      const newFeedback = new Feedback({
        userId,
        userEmail,
        type: type || "other",
        message: message.trim().slice(0, 2000),
        appVersion: appVersion || "v2.6.4",
        deviceInfo: deviceInfo || "",
        status: "received",
        createdAt: new Date(),
      });

      const saved = await newFeedback.save();
      return res.status(201).json({ success: true, feedback: saved });
    }

    // 3. DELETE: Remove a feedback query from MongoDB
    if (req.method === "DELETE") {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: "Missing feedback ID to delete." });
      }

      const deleted = await Feedback.findOneAndDelete({ _id: id, userId });
      if (!deleted) {
        // Try deleting by _id if matched
        const fallbackDelete = await Feedback.findByIdAndDelete(id);
        if (!fallbackDelete) {
          return res.status(404).json({ error: "Feedback query not found or already deleted." });
        }
      }

      return res.status(200).json({ success: true, message: "Feedback query deleted successfully from MongoDB." });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Feedback API Error:", error);
    return res.status(500).json({ error: "Failed to connect to feedback database." });
  }
}
