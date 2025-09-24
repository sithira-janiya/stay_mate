const express = require("express");
const {
  listUtilityBills,
  createUtilityBill,
  payUtilityBill,
  listUtilityPayments,
} = require("../controllers/utilityController");

const router = express.Router();

// Bills
router.get("/bills", listUtilityBills);
router.post("/bills", createUtilityBill);

// Pay routes (support both styles)
router.post("/bills/:id/pay", payUtilityBill); // existing
router.post("/pay", payUtilityBill);           // <-- add this

// Payments listing
router.get("/payments", listUtilityPayments);

module.exports = router;
