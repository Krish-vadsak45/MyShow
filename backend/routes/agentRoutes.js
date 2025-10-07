import { Router } from "express";
import Agent from "../controllers/agent.controller.js";

const agentRoutes = Router();

agentRoutes.post("/", Agent);

export default agentRoutes;