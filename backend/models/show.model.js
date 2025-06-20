import mongoose from "mongoose";
import Movie from "../models/movie.model.js";

const showSchema = new mongoose.Schema(
  {
    Movie: { type: String, required: true, ref: Movie },
    showDateTime: { type: String, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Object, default: {} },
  },
  { minimize: false }
);

const Show = mongoose.model("Show", showSchema);
export default Show;
