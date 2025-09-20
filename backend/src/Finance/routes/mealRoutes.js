import express from "express";
import { listMealInvoices, payMealInvoice, listMealPayments } from "../controllers/mealController.js";

const router = express.Router();

router.get("/invoices", listMealInvoices);
router.post("/payments", payMealInvoice);
router.get("/payments", listMealPayments);

export default router;
