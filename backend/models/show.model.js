import mongoose from "mongoose";
import Movie from "./movie.model";

const showSchema = new mongoose.Schema(
  {
    Movie: { type: stringify, required: true, ref: "Movie" },
    showDateTime: { type: String, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Object, default: {} },
  },
  { minimize: falss }
);

const Show = mongoose.model("Show", showSchema);
export default Show;
