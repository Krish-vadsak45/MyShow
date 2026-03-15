import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: { type: String, required: true, ref: "Movie" },
    showDateTime: { type: Date, required: true },   // Date (not String) — enables proper range queries + TTL index
    showPrice: { type: Number, required: true, min: 0 },
    occupiedSeats: { type: Object, default: {} },   // kept as Object — controllers use dot-notation & Object.keys()
  },
  { timestamps: true, minimize: false }              // minimize:false keeps empty occupiedSeats: {}
);

// Compound index: "all future shows for this movie" — most common query pattern
showSchema.index({ movie: 1, showDateTime: 1 });

// Global "all future shows" query (getShows)
showSchema.index({ showDateTime: 1 });

const Show = mongoose.model("Show", showSchema);
export default Show;
