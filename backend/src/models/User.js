import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nic: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: {
      type: String,
      enum: ["Tenant", "Admin", "Manager"],
      default: "Tenant",
    },
    alcoholic: { type: Boolean, default: false },
    foodAllergies: { type: String },
    occupation: {
      type: String,
      enum: ["University Student", "Employee", "Other"],
      default: "Other",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
