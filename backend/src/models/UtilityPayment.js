// 🔎 COLLECTION NAME: "utilitypayments"  <-- change if your team prefers another name
import mongoose from "mongoose";

const UtilityPaymentSchema = new mongoose.Schema({
  billId: { type: mongoose.Schema.Types.ObjectId, ref: "UtilityBill", required: true },
  amountPaid: { type: Number, min: 0, required: true },
  paymentMethod: { type: String, enum: ["cash", "bank", "card", "online"], required: true },
  paidDate: { type: Date, required: true },
  reference: { type: String } // optional bank ref / note
}, { timestamps: true });

UtilityPaymentSchema.index({ billId: 1 });

export default mongoose.model("UtilityPayment", UtilityPaymentSchema, "utilitypayments");
