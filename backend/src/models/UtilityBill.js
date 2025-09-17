// 🔎 COLLECTION NAME: "utilities"  <-- match your team's naming if different
import mongoose from "mongoose";

const UtilityBillSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true }, // 🔁 change model name if your team uses different
  type: { type: String, enum: ["water", "electricity"], required: true },
  month: { type: String, match: /^\d{4}-(0[1-9]|1[0-2])$/, required: true }, // YYYY-MM
  amount: { type: Number, min: 0, required: true },
  billDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  photoUrl: { type: String }, // for now use a URL; file upload (multer) can be added later
  status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" }
}, { timestamps: true });

UtilityBillSchema.index({ propertyId: 1, month: 1, type: 1 }, { unique: true }); // prevent dup bills per month/type/property

export default mongoose.model("UtilityBill", UtilityBillSchema, "utilities");
