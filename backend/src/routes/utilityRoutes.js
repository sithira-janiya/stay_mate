import express from "express";
import { listBills, createBill, payBill, listPayments } from "../controllers/utilityController.js";

const router = express.Router();

// GET /api/owner/utilities/bills
router.get("/bills", listBills);

// POST /api/owner/utilities/bills
router.post("/bills", createBill);

// POST /api/owner/utilities/pay
router.post("/pay", payBill);

// GET /api/owner/utilities/payments
router.get("/payments", listPayments);

export default router;
