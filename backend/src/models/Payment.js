// 🔶 COLLECTION NAME: 'payments'
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    paymentCode: { type: String, required: true, unique: true, index: true },

    invoiceId:   { type: mongoose.Types.ObjectId, ref: "rentinvoices", required: true },

    amountPaid:    { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Cash","Bank Transfer","Card","Online"], required: true },
    paymentDate:   { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "payments" }
);

PaymentSchema.index({ paymentDate: -1 });

export default mongoose.model("Payment", PaymentSchema);
