import express from "express";
import {
  getFavourite,
  getUserBookings,
  updateFavourite,
} from "../controllers/userControllers.js";
import { auth } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.get("/bookings", auth, getUserBookings);
userRouter.post("/update-favourite", auth, updateFavourite);
userRouter.get("/favourites", auth, getFavourite);

export default userRouter;
