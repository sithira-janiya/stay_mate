// feedbackRoutes.js
import express from "express";
import { addFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", addFeedback);  // Tenant submits feedback

export default router;