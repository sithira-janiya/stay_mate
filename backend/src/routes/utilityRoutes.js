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

// Payments
router.post("/pay", payUtilityBill);
router.get("/payments", listUtilityPayments);

export default router;
