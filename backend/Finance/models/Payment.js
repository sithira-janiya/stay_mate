// backend/Finance/models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    // Human-friendly sequential code (PMT001, etc.)
    paymentCode: { type: String, required: true, unique: true, index: true },

    // Link back to RentInvoice
    invoiceId: {
      type: mongoose.Types.ObjectId,
      ref: "RentInvoice",
      required: true,
      index: true,
    },

    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Card", "Online"],
      required: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

// Helpful index for recent queries
PaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model("Payment", PaymentSchema);
