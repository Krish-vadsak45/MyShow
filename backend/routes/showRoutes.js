import express from "express";
import {
  addShow,
  getNowPlayingMovies,
  getShow,
  getShows,
  getNotifyCount,
} from "../controllers/showControllers.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies);
showRouter.post("/add", protectAdmin, addShow);
showRouter.get("/all", getShows);
showRouter.get("/:movieId", getShow);
showRouter.post("/notify-count", protectAdmin, getNotifyCount);

export default showRouter;
