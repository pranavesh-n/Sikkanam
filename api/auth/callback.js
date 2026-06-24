import { supabase } from "../utils/db.js";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_me";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
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
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: "Failed to exchange code: " + tokenData.error_description });
    }

    const { access_token } = tokenData;

    // 2. Fetch user details from Google UserInfo API
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`);
    const userData = await userResponse.json();

    if (userData.error) {
      return res.status(400).json({ error: "Failed to fetch user data: " + userData.error.message });
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

    // 4. Create stateless JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Serialize JWT token into a secure HttpOnly cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);

    // 6. Redirect client back to frontend /profile route
    return res.redirect("/profile");
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
