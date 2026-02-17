import {
  createBooking,
  getOccupiedSeats,
  lockSeats,
  unlockSeats,
} from "../controllers/bookingControllers.js";
import express from "express";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.post("/lock-seats", lockSeats);
bookingRouter.post("/unlock-seats", unlockSeats);

export default bookingRouter;
