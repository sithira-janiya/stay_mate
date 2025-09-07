import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },               // userId (string) for simplicity with Socket data
    fromRole: { type: String, enum: ["tenant", "supplier", "admin"], required: true },
    to: { type: String, default: null },                  // userId (string) or null for broadcast-to-suppliers
    message: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

chatMessageSchema.index({ createdAt: 1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
