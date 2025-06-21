import express from "express";
import {
  getFavourite,
  getUserBookings,
  updateFavourite,
} from "../controllers/userControllers.js";

const userRouter = express.Router();

userRouter.get("/bookings", getUserBookings);
userRouter.post("/update-favourite", updateFavourite);
userRouter.get("/favourites", getFavourite);

export default userRouter;
