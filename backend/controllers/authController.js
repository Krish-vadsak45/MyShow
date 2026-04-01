import logger from "../config/logger.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 70 * 1000, // 70s — slightly longer than Clerk's 60s JWT expiry
  path: "/",
};

export const setSession = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token required" });
    }
    res.cookie("__auth_token", token, cookieOptions);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "setSession error");
    res.status(500).json({ success: false, message: "Session creation failed" });
  }
};

export const clearSession = (req, res) => {
  try {
    res.clearCookie("__auth_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "clearSession error");
    res.status(500).json({ success: false, message: "Session clear failed" });
  }
};
