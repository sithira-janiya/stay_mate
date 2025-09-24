// backend/Finance/models/MealPayment.js
const mongoose = require("mongoose");

const mealPaymentSchema = new mongoose.Schema(
  {
    paymentCode:   { type: String, index: true }, // e.g. MPMT001
    invoiceId:     { type: mongoose.Types.ObjectId, ref: "MealInvoice", required: true },
    supplierId:    { type: mongoose.Types.ObjectId, ref: "User", required: true },
    amountCents:   { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Cash","Bank Transfer","Card","Online"], required: true },
    paymentDate:   { type: Date, default: Date.now },
    notes:         { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MealPayment", mealPaymentSchema);