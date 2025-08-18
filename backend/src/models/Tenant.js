import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomNumber: { type: String },
  allergies: [{ type: String }], // e.g., ["peanut","dairy","gluten"]
  email: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.model("Tenant", tenantSchema);
