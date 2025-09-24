// backend/Finance/routes/mealRoutes.js
const express = require("express");
const {
  listMealInvoices,
  payMealInvoice,
  listMealPayments,
} = require("../controllers/mealPaymentController");

const router = express.Router();

router.get("/invoices",  listMealInvoices);
router.post("/payments",  payMealInvoice);     // create a payment (pay an invoice)
router.get("/payments",   listMealPayments);   // list payments

module.exports = router;