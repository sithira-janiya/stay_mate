// backend/src/routes/analyticsRoutes.js
import express from "express";
import { getSupplierAnalytics, getMonthlyIncome } from "../controllers/analyticsController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Supplier analytics
router.get(
  "/",
  authenticate,
  authorize("supplier", "admin"),
  getSupplierAnalytics
);

// Supplier monthly income
router.get(
  "/income",
  authenticate,
  authorize("supplier", "admin"),
  getMonthlyIncome
);

export default router;
