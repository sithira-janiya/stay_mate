// backend/Finance/routes/rentRoutes.js
const express = require("express");
const {
  listInvoices,
  listPayments,
  generateInvoices,
  createReceipt,
  deleteInvoice,          
} = require("../controllers/rentController");

const router = express.Router();


router.get("/invoices", listInvoices);

router.get("/payments", listPayments);

router.post("/generate", generateInvoices);

router.post("/receipt", createReceipt);

router.delete("/invoices/:id", deleteInvoice);  

module.exports = router;
