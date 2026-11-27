import { getSessionFromReq } from "../_utils/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const decoded = getSessionFromReq(req);

  if (!decoded) {
    return res.status(200).json({ loggedIn: false });
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
  });
}
