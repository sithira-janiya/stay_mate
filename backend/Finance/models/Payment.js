// backend/Finance/models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    paymentCode: { type: String, required: true, unique: true, index: true },
    // If your RentInvoice model name is "RentInvoice", set ref to that.
    invoiceId:   { type: mongoose.Types.ObjectId, ref: "RentInvoice", required: true },
    amountPaid:    { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Cash","Bank Transfer","Card","Online"], required: true },
    paymentDate:   { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "payments" }
);

PaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model("Payment", PaymentSchema);