import mongoose from "mongoose";

// Inline sub-schemas with _id disabled (these are embedded, not referenced)
const genreSchema = new mongoose.Schema(
  { id: { type: Number }, name: { type: String, trim: true } },
  { _id: false }
);

const castSchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String, trim: true },
    character: { type: String, trim: true },
    profile_path: { type: String },
    order: { type: Number },
  },
  { _id: false }
);

const crewSchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String, trim: true },
    job: { type: String, trim: true },
    department: { type: String, trim: true },
    profile_path: { type: String },
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // TMDB ID used as natural key
    title: { type: String, required: true, trim: true },
    overview: { type: String, required: true },
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    release_date: { type: Date, required: true },    // Date (not String) for proper sorting/filtering
    original_language: { type: String, trim: true },
    tagline: { type: String, default: "", trim: true },
    genres: { type: [genreSchema], required: true, default: [] },
    cast: { type: [castSchema], required: true, default: [] },
    crew: { type: [crewSchema], required: true, default: [] },
    vote_average: { type: Number, required: true, default: 0, min: 0, max: 10 },
    runtime: { type: Number, required: true, default: 0, min: 0 },
    trailerKey: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for filter queries used in getShows
movieSchema.index({ original_language: 1 });
movieSchema.index({ "genres.name": 1 });
movieSchema.index({ release_date: 1 });

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
