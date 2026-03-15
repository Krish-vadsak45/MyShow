import express from "express";
import { setSession, clearSession } from "../controllers/authController.js";

const router = express.Router();

router.post("/session", setSession);
router.post("/logout", clearSession);

export default router;
