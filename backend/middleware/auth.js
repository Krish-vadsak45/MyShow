import { clerkClient, verifyToken } from "@clerk/express";

const getVerifiedUserId = async (req) => {
  const token = req.cookies?.__auth_token;
  if (!token) return null;
  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
    clockSkewInMs: 3 * 60 * 1000, // tolerate up to 3 min clock drift
  });
  return payload?.sub ?? null;
};

export const protectAdmin = async (req, res, next) => {
  try {
    const userId = await getVerifiedUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await clerkClient.users.getUser(userId);
    if (user.privateMetadata.role !== "admin") {
      return res.json({
        success: false,
        isAdmin: false,
        message: "unauthorized",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "not-authorized" });
  }
};

export const auth = async (req, res, next) => {
  try {
    const userId = await getVerifiedUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.userId = userId;
    req.user = await clerkClient.users.getUser(userId);
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "Not authorized" });
  }
};
