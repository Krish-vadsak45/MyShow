import {
  createBooking,
  getOccupiedSeats,
  lockSeats,
  unlockSeats,
} from "../controllers/bookingControllers.js";
import express from "express";
import { auth } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", auth, createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.post("/lock-seats", auth, lockSeats);
bookingRouter.post("/unlock-seats", auth, unlockSeats);

export default bookingRouter;
