import Movie from "../models/movie.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";
import { clerkClient } from "@clerk/express";

// Simple logic: recommend movies based on user's most booked genre
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id; // assuming you use auth middleware
    const now = new Date().toISOString();

    // 1. Get all user's bookings, populate movie
    const bookings = await Booking.find({ user: userId }).populate({
      path: "show",
      populate: { path: "movie" },
    });

    // 1b. Get user's favourite movies (movie IDs are in user.privateMetadata.favourite)
    let favouriteMovies = [];
    let favouriteMovieIds = [];
    const user = await clerkClient.users.getUser(userId);
    if (
      user &&
      user.privateMetadata &&
      Array.isArray(user.privateMetadata.favourite) &&
      user.privateMetadata.favourite.length > 0
    ) {
      favouriteMovieIds = user.privateMetadata.favourite;
      favouriteMovies = await Movie.find({ _id: { $in: favouriteMovieIds } });
    }
    // 2. Count genres from bookings and favourites
    const genreCount = {};
    // From bookings
    bookings.forEach((b) => {
      const genres = b.show?.movie?.genres || [];
      genres.forEach(({ name }) => {
        genreCount[name] = (genreCount[name] || 0) + 1;
      });
    });
    // From favourites
    favouriteMovies.forEach((m) => {
      const genres = m.genres || [];
      genres.forEach(({ name }) => {
        genreCount[name] = (genreCount[name] || 0) + 2; // Give more weight to favourites
      });
    });

    // console.log(genreCount);

    // 3. Find top genre(s)
    const topGenreNames = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name]) => name);
    // console.log("Top genre type:", typeof topGenreNames);
    // console.log("Is array:", Array.isArray(topGenreNames));
    // console.log("Value:", topGenreNames);

    // 4. Recommend upcoming shows for those genres
    let recommended = [];
    if (topGenreNames.length) {
      // Find all movies in those genres
      const moviesInGenres = await Movie.find({
        "genres.name": { $in: topGenreNames },
      }).select("_id");
      const movieIds = moviesInGenres.map((m) => m._id.toString());
      // console.log("moviesInGenres", movieIds);

      // Find all upcoming shows for those movies
      const upcomingShows = await Show.find({
        movie: { $in: movieIds },
        showDateTime: { $gte: now },
      }).populate("movie");
      // console.log("upcomingShows", upcomingShows);

      // Get unique movie IDs from those shows
      const availableMovieIds = [
        ...new Set(upcomingShows.map((show) => show.movie._id.toString())),
      ];
      // console.log("availableMovieIds", availableMovieIds);

      // Exclude movies already booked by the user
      const bookedMovieIds = bookings.map((b) =>
        b.show?.movie?._id?.toString()
      );
      // console.log("bookedMovieIds", bookedMovieIds);

      // Recommend only movies with available shows and not already booked
      recommended = await Movie.find({
        _id: { $in: availableMovieIds },
      }).limit(10);
      // console.log(recommended);
    } else {
      // fallback: recommend popular movies
      const upcomingShows = await Show.find({
        showDateTime: { $gte: now },
      }).populate("movie");
      const availableMovieIds = [
        ...new Set(upcomingShows.map((show) => show.movie._id.toString())),
      ];
      recommended = await Movie.find({ _id: { $in: availableMovieIds } })
        .sort({ popularity: -1 })
        .limit(10);
    }

    res.json({ success: true, recommended });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Recommendation error" });
  }
};
