import mongoose from "mongoose";
const chatMessageSchema = new mongoose.Schema({
  toTenantId: { type: String }, // room id for tenant; optional for tenant->supplier messages
  from: { type: String, required: true }, // id or name
  role: { type: String, enum: ["tenant", "supplier"], required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("ChatMessage", chatMessageSchema);
