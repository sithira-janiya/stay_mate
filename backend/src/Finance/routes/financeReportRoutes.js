//financeReportRoutes.js
import express from "express";
import {
  generateFinanceReport,
  listFinanceReports,
  getFinanceReport
} from "../controllers/financeReportController.js";

const router = express.Router();

router.post("/generate", generateFinanceReport);
router.get("/", listFinanceReports);
router.get("/:id", getFinanceReport);

export default router;
