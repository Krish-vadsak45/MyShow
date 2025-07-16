import express from "express";
import {
  fetchUpcoming,
  toggleNotify,
  adminList,
  notifyUsers,
  getUserNotified,
  // ...add any other exports here
} from "../controllers/upcomingControllers.js";
import { auth, protectAdmin } from "../middleware/auth.js";

const upcomingRoutes = express.Router();

upcomingRoutes.get("/", fetchUpcoming);
upcomingRoutes.post("/notify", auth, toggleNotify);
upcomingRoutes.get("/user/notified", auth, getUserNotified);
upcomingRoutes.get("/admin", protectAdmin, adminList);

export default upcomingRoutes;
