// backend/Finance/models/UtilityBill.js
const mongoose = require("mongoose");

const UtilityBillSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    month:      { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    type:       { type: String, enum: ["water", "electricity"], required: true },
    amount:     { type: Number, required: true, min: 0 },
    dueDate:    { type: Date, required: true },
    status:     { type: String, enum: ["unpaid", "paid", "overdue"], default: "unpaid" },
    billImageUrl: { type: String, default: "" },
    notes:        { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UtilityBill", UtilityBillSchema);