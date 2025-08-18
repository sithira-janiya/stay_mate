// analyticsRoutes.js
import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", getAnalytics);  // Admin views analytics

export default router;