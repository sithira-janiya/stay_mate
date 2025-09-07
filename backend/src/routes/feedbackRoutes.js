import express from "express";
import { addFeedback, getSupplierFeedback } from "../controllers/feedbackController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, authorize("tenant"), addFeedback);
router.get("/", authenticate, authorize("supplier"), getSupplierFeedback);

export default router;
