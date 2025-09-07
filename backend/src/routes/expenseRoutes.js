// backend/src/routes/expenseRoutes.js
import express from "express";
import { getExpenseAnalytics } from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/analytics", authenticate, authorize("tenant"), getExpenseAnalytics);

export default router;