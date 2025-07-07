import express from "express";
import { getPersonalizedRecommendations } from "../controllers/recommendationController.js";
import { auth } from "../middleware/auth.js";

const recommendationRoutes = express.Router();
recommendationRoutes.get("/personalized", auth, getPersonalizedRecommendations);
export default recommendationRoutes;
