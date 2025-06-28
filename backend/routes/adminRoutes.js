import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import {
  getAllBookings,
  getAllShows,
  getDashboardData,
  isAdmin,
} from "../controllers/adminControllers.js";
import { getAdminAnalytics } from "../controllers/adminAnalytics.js";

const adminRouter = express.Router();

adminRouter.get("/is-admin", protectAdmin, isAdmin);
adminRouter.get("/dashboard", protectAdmin, getDashboardData);
adminRouter.get("/all-shows", protectAdmin, getAllShows);
adminRouter.get("/all-bookings", protectAdmin, getAllBookings);

// Add this route (protect with admin middleware if needed)
adminRouter.get("/analytics", protectAdmin, getAdminAnalytics);

export default adminRouter;
