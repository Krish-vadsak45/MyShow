const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 70 * 1000, // 70s — slightly longer than Clerk's 60s JWT expiry
  path: "/",
};

export const setSession = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: "Token required" });
  }
  res.cookie("__auth_token", token, cookieOptions);
  res.json({ success: true });
};

export const clearSession = (req, res) => {
  res.clearCookie("__auth_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  res.json({ success: true });
};
