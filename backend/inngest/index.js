import { Inngest } from "inngest";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import Show from "..//models/show.model.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("Starting user sync", event.data);
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      phone_numbers,
    } = event.data;
    console.log(
      "Starting user sync",
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      phone_numbers
    );

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
      mobile_no: phone_numbers[0].phone_number,
    };
    await User.create(userData);
  }
);

// Inngest function to delete user data to a database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    console.log("Starting user sync", event.data);

    await User.findByIdAndDelete({ _id: id });
  }
);

// Inngest function to update user data to a database
const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      phone_numbers,
    } = event.data;
    console.log("Starting user sync", event.data);

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
      mobile_no: phone_numbers[0].phone_number,
    };
    await User.findByIdAndUpdate(id, userData);
  }
);

// Inngest Function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minuts", tenMinutesLater);
    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      //if payment is not made , release seats and delete booking
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdate,
  releaseSeatsAndDeleteBooking,
];
