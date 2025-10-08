import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = await req.auth();
    if (!userId) {
      return res.status(401).json({ success: false, message: userId });
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
    res.json({ success: false, message: "not-authorized" });
  }
};

export const auth = async (req, res, next) => {
  try {
    const { userId } = await req.auth();
    console.log("loda", userId);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Optionally, attach user info to req for downstream use
    req.user = await clerkClient.users.getUser(userId);
    // console.log(req.user);
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "Not authorized" });
  }
};
