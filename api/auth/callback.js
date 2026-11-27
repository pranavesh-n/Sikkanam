import crypto from "crypto";
import { parse, serialize } from "cookie";
import { supabase } from "../_utils/db.js";
import { signToken, createSessionCookie } from "../_utils/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const isSecure =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview";

  const clearStateCookie = serialize("oauth_state", "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  const cookies = parse(req.headers?.cookie || "");
  const expectedState = cookies.oauth_state;
  const { code, state } = req.query || {};

  const stateValid =
    typeof state === "string" &&
    typeof expectedState === "string" &&
    state.length > 0 &&
    state.length === expectedState.length &&
    crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState));

  if (!stateValid) {
    res.setHeader("Set-Cookie", clearStateCookie);
    return res.status(403).json({ error: "Invalid or missing OAuth state" });
  }

  if (!code) {
    res.setHeader("Set-Cookie", clearStateCookie);
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${protocol}://${host}/api/auth/callback`;

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      signal: AbortSignal.timeout(6000),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.warn("OAuth token exchange error:", tokenData.error);
      res.setHeader("Set-Cookie", clearStateCookie);
      return res.status(400).json({ error: "Failed to exchange authorization code." });
    }

    const { access_token } = tokenData;

    // 2. Fetch user details from Google UserInfo API
    const userResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      { signal: AbortSignal.timeout(6000) }
    );
    const userData = await userResponse.json();

    if (userData.error) {
      console.warn("OAuth userinfo error:", userData.error?.message || userData.error);
      res.setHeader("Set-Cookie", clearStateCookie);
      return res.status(400).json({ error: "Failed to fetch user data from Google." });
    }

    const { email, name, picture } = userData;

    // 3. Database connection and User creation/update
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Supabase user lookup error:", userError);
      return res.status(500).json({ error: "Database error during authentication." });
    }

    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ email, name, avatar: picture }])
        .select()
        .single();
      
      if (insertError) {
        console.error("Supabase user insert error:", insertError);
        return res.status(500).json({ error: "Database error creating user." });
      }
      user = newUser;
    } else {
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ name, avatar: picture })
        .eq("email", email)
        .select()
        .single();

      if (updateError) {
        console.error("Supabase user update error:", updateError);
        return res.status(500).json({ error: "Database error updating user." });
      }
      user = updatedUser;
    }

    // 4. Create anti-hijacking JWT bound to client device
    const token = signToken({ id: user.id, email: user.email }, "30d", req);

    // 5. Serialize JWT token into a secure HttpOnly cookie and clear OAuth state cookie
    const cookie = createSessionCookie(token);

    res.setHeader("Set-Cookie", [clearStateCookie, cookie]);

    // 6. Redirect client back to frontend /profile route
    return res.redirect("/profile");
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
