import { Router } from "express";
import Agent from "../controllers/agent.controller.js";
import { auth } from "../middleware/auth.js";

const agentRoutes = Router();

agentRoutes.post("/", auth, Agent);

export default agentRoutes;
