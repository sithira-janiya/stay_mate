import express from "express";
import {
  listInvoices,
  listPayments,
  generateInvoices,
  createReceipt,
} from "../controllers/rentController.js";

const router = express.Router();

// GET /api/owner/rent/invoices?propertyId=&tenantId=&month=YYYY-MM
router.get("/invoices", listInvoices);

// GET /api/owner/rent/payments?propertyId=&tenantId=&month=YYYY-MM
router.get("/payments", listPayments);

// POST /api/owner/rent/generate { month: "YYYY-MM", dueDate: "YYYY-MM-DD" }
router.post("/generate", generateInvoices);

// POST /api/owner/rent/receipt { invoiceId, amountPaid, paymentMethod }
router.post("/receipt", createReceipt);

export default router;
