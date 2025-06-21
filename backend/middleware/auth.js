import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await clerkClient.users.get(userId);
    if (user.privateMetadata !== admin) {
      return res.json({ success: false, message: "unauthorized" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "not-authorized" });
  }
};
