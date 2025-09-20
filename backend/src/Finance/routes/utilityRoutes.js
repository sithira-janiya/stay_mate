import express from "express";
import {
  listUtilityBills,
  createUtilityBill,
  payUtilityBill,
  listUtilityPayments,
} from "../controllers/utilityController.js";

const router = express.Router();

// Bills
router.get("/bills", listUtilityBills);
router.post("/bills", createUtilityBill);

// Pay a specific bill
router.post("/bills/:id/pay", payUtilityBill);

// Payments listing
router.get("/payments", listUtilityPayments);

export default router;
