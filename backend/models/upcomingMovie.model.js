import mongoose from "mongoose";
import User from "../models/user.model.js";

const upcomingMovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: String,
  posterPath: String,
  releaseDate: Date,
  notifyUsers: [{ type: String, ref: "User" }],
  notified: { type: Boolean, default: false },
});

const UpcomingMovie = mongoose.model("UpcomingMovie", upcomingMovieSchema);
export default UpcomingMovie;
