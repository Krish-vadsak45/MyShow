import mongoose from "mongoose";

const upcomingMovieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true, unique: true }, // unique creates index automatically
    title: { type: String, trim: true },
    posterPath: { type: String },
    releaseDate: { type: Date },
    notifyUsers: [{ type: String, ref: "User" }],
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Range queries: "movies releasing between date A and date B"
upcomingMovieSchema.index({ releaseDate: 1 });

// Notification job: find un-notified movies past their release date
upcomingMovieSchema.index({ notified: 1, releaseDate: 1 });

// "Which movies has this user subscribed to?" (getUserNotified)
upcomingMovieSchema.index({ notifyUsers: 1 });

const UpcomingMovie = mongoose.model("UpcomingMovie", upcomingMovieSchema);
export default UpcomingMovie;
