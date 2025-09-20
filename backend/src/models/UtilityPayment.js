import mongoose from "mongoose";

const UtilityPaymentSchema = new mongoose.Schema(
  {
    paymentCode:   { type: String, required: true, unique: true }, // e.g. UPM001
    billId:        { type: mongoose.Schema.Types.ObjectId, ref: "UtilityBill", required: true },
    propertyId:    { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true }, // convenience
    month:         { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    type:          { type: String, enum: ["water", "electricity"], required: true },
    amountPaid:    { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Cash","Bank Transfer","Card","Online"], required: true },
    paymentDate:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("UtilityPayment", UtilityPaymentSchema);

