import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  meals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meal" }],
  totalCost: { type: Number, required: true },
  status: { type: String, enum: ["processing", "out for delivery", "delivered"], default: "processing" }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
