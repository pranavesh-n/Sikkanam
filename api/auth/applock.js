import { connectToDatabase } from "../utils/db.js";
import { UserSettings } from "../utils/models.js";
import { getSessionFromReq } from "../utils/auth.js";

export default async function handler(req, res) {
  const decoded = getSessionFromReq(req);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  const userId = decoded.id;
  const userEmail = decoded.email;

  try {
    await connectToDatabase();

    if (req.method === "GET") {
      const settings = await UserSettings.findOne({ userId });
      if (!settings) {
        return res.status(200).json({ appLockEnabled: false, appLockPinHash: "" });
      }
      return res.status(200).json({
        appLockEnabled: settings.appLockEnabled || false,
        appLockPinHash: settings.appLockPinHash || "",
      });
    }

    if (req.method === "POST") {
      const { appLockEnabled, appLockPinHash } = req.body;

      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        {
          userId,
          email: userEmail,
          appLockEnabled: Boolean(appLockEnabled),
          appLockPinHash: appLockPinHash || "",
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        appLockEnabled: settings.appLockEnabled,
        appLockPinHash: settings.appLockPinHash,
      });
    }

    if (req.method === "DELETE") {
      await UserSettings.findOneAndUpdate(
        { userId },
        {
          appLockEnabled: false,
          appLockPinHash: "",
          updatedAt: new Date(),
        }
      );
      return res.status(200).json({ success: true, message: "App Lock disabled across all devices" });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("AppLock Sync API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
