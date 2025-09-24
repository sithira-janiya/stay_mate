// backend/Finance/models/UtilityBill.js
const mongoose = require("mongoose");

const UtilityBillSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    month:      { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // YYYY-MM
    type:       { type: String, enum: ["water", "electricity"], required: true },
    amount:     { type: Number, required: true, min: 0 },
    dueDate:    { type: Date, required: true },
    status:     { type: String, enum: ["unpaid", "paid", "overdue"], default: "unpaid" },
    billImageUrl: { type: String, default: "" },
    notes:        { type: String, default: "" },
  },
  { timestamps: true }
);

// Optional helper
UtilityBillSchema.methods.computeStatus = function () {
  if (this.status === "paid") return "paid";
  const today = new Date();
  return this.dueDate && this.dueDate < new Date(today.toDateString()) ? "overdue" : "unpaid";
};

module.exports = mongoose.model("UtilityBill", UtilityBillSchema);