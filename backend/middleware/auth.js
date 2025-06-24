import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    // console.log(req.auth());
    const { userId } = req.auth();

    const user = await clerkClient.users.getUser(userId);
    console.log(user.privateMetadata);
    if (user.privateMetadata.role !== "admin") {
      return res.json({ success: false, message: "unauthorized" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "not-authorized" });
  }
};
