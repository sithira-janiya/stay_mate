// backend/Finance/models/MealInvoice.js
const mongoose = require("mongoose");

const mealInvoiceSchema = new mongoose.Schema(
  {
    invoiceCode: { type: String, index: true },     // e.g. MINV001
    month:       { type: String, required: true },  // "YYYY-MM"
    supplierId:  { type: mongoose.Types.ObjectId, ref: "User", required: true },
    orderCount:  { type: Number, default: 0 },
    amountCents: { type: Number, required: true, min: 0 },
    status:      { type: String, enum: ["unpaid", "paid"], default: "unpaid", index: true },
    dueDate:     { type: Date },
    notes:       { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MealInvoice", mealInvoiceSchema);
