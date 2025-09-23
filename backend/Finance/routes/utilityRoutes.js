// backend/Finance/routes/utilityRoutes.js
const express = require("express");
const {
  listUtilityBills,
  createUtilityBill,
  payUtilityBill,
  listUtilityPayments,
} = require("../controllers/utilityController");

const router = express.Router();

// Bills
router.get("/bills",  listUtilityBills);
router.post("/bills", createUtilityBill);

// Pay a specific bill
router.post("/bills/:id/pay", payUtilityBill);

// Payments
router.get("/payments", listUtilityPayments);

module.exports = router;
