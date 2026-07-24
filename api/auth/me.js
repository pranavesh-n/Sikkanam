import { connectToDatabase } from "../_utils/db.js";
import { UserSettings } from "../_utils/models.js";
import { getSessionFromReq } from "../_utils/auth.js";

export default async function handler(req, res) {
  const decoded = getSessionFromReq(req);

  if (!decoded) {
    return res.status(200).json({ loggedIn: false });
  }

  const userId = decoded.id;
  const userEmail = decoded.email;

  try {
    await connectToDatabase();

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

    // GET Method: Return User & AppLock Settings
    let appLockEnabled = false;
    let appLockPinHash = "";

    try {
      const settings = await UserSettings.findOne({ userId });
      if (settings) {
        appLockEnabled = settings.appLockEnabled || false;
        appLockPinHash = settings.appLockPinHash || "";
      }
    } catch (e) {
      console.warn("Failed to fetch user settings in me.js:", e);
    }

    return res.status(200).json({
      loggedIn: true,
      user: {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0],
        avatar: decoded.avatar,
      },
      appLockEnabled,
      appLockPinHash,
    });
  } catch (error) {
    console.error("Auth me endpoint error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
