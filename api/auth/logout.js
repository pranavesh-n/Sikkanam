import { createClearSessionCookie } from "../utils/auth.js";

export default async function handler(req, res) {
  const cookie = createClearSessionCookie();

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ success: true });
}
