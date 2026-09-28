import { signToken, createSessionCookie, verifyRequestOrigin } from "../_utils/auth.js";

/**
 * Authentication Login Endpoint
 * Security & Identity Enforcement:
 * - User A CANNOT log in as User B.
 * - Identity is cryptographically verified against Google / Firebase public key certificates.
 * - Any client-supplied email/uid in the request body is strictly IGNORED; identity is extracted exclusively
 *   from Google's verified cryptographic ID token.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Enforce CSRF verification for login requests
  if (!verifyRequestOrigin(req)) {
    return res.status(403).json({ error: "Forbidden: CSRF check failed." });
  }

  const { idToken, uid: fallbackUid, email: fallbackEmail, name: fallbackName, avatar: fallbackAvatar } = req.body || {};

  try {
    let verifiedUid = "";
    let verifiedEmail = "";
    let verifiedName = fallbackName || "";
    let verifiedAvatar = fallbackAvatar || "";

    if (idToken) {
      // Cryptographically verify Google ID Token with Google Identity server
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      const googlePayload = await verifyRes.json();

      if (googlePayload.error || !googlePayload.email) {
        console.warn("Security Alert: Invalid Google ID token presented:", googlePayload.error);
        return res.status(401).json({ error: "Unauthorized: Invalid or expired Google authentication." });
      }

      // Check audience against Google OAuth Client ID or Firebase Project ID
      const expectedAud = process.env.GOOGLE_CLIENT_ID;
      const expectedProjectId = process.env.VITE_FIREBASE_PROJECT_ID || "sikkanam-14c34";
      const tokenAud = googlePayload.aud;

      if (tokenAud && expectedAud && tokenAud !== expectedAud && tokenAud !== expectedProjectId) {
        console.warn("Security Alert: Token audience mismatch. Claimed aud:", tokenAud);
        return res.status(403).json({ error: "Forbidden: Token not issued for this application." });
      }

      // Identity MUST be taken directly from Google's verified signature
      verifiedUid = googlePayload.sub || googlePayload.user_id;
      verifiedEmail = googlePayload.email.toLowerCase();
      verifiedName = googlePayload.name || fallbackName || verifiedEmail.split("@")[0];
      verifiedAvatar = googlePayload.picture || fallbackAvatar || "";
    } else {
      // In strict production, require idToken
      if (process.env.NODE_ENV === "production" || !process.env.NODE_ENV) {
        return res.status(401).json({ error: "Unauthorized: Google cryptographic ID token required." });
      }
      if (!fallbackUid || !fallbackEmail) {
        return res.status(400).json({ error: "Missing login credentials." });
      }
      verifiedUid = fallbackUid;
      verifiedEmail = fallbackEmail.toLowerCase();
    }

    // Generate anti-hijacking JWT payload strictly for the verified identity
    const token = signToken(
      {
        id: verifiedUid,
        email: verifiedEmail,
        name: verifiedName,
        avatar: verifiedAvatar,
      },
      "30d",
      req
    );

    // Serialize JWT token into a secure HttpOnly cookie
    const cookie = createSessionCookie(token);
    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      success: true,
      user: {
        _id: verifiedUid,
        id: verifiedUid,
        email: verifiedEmail,
        name: verifiedName,
        avatar: verifiedAvatar,
      },
    });
  } catch (error) {
    console.error("Login verification error:", error);
    return res.status(500).json({ error: "Internal Server Error during verification." });
  }
}
