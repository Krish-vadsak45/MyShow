import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, ref: "User" },
    show: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Show" }, // ObjectId (Show uses default _id)
    amount: { type: Number, required: true, min: 0 },
    bookedSeats: { type: [String], required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String, default: "" },
  },
  { timestamps: true }
);

// Most common query: all bookings for a user, newest first
bookingSchema.index({ user: 1, createdAt: -1 });

// Used when verifying seat locks per show
bookingSchema.index({ show: 1 });

// Admin queries filtering by payment status
bookingSchema.index({ isPaid: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
