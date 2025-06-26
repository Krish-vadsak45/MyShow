import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = await req.auth();
    if (!userId) {
      return res.status(401).json({ success: false, message: userId });
    }
    const user = await clerkClient.users.getUser(userId);
    if (user.privateMetadata.role !== "admin") {
      return res.json({ success: false, message: "unauthorized" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "not-authorized" });
  }
};
