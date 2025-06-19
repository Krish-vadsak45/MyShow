import { Inngest } from "inngest";
import User from "../models/user.model.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log(event.data);
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      phone_numbers,
    } = event.data;
    await User.create({
      _id: "testid123",
      name: "Test User",
      email: "test@example.com",
      image: "test.jpg",
      mobile_no: "+1234567890",
    });
    console.log(event.data);
    await User.create({
      _id: "testid123",
      name: "Test User",
      email: "test@example.com",
      image: "test.jpg",
      mobile_no: "+1234567890",
    });
    console.log("Dummy user created!");

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
    console.log(event.data);
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
    console.log(event.data);
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

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdate];
