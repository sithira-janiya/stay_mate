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
      enum: ["Tenant", "Owner", "MealSupplier"],
      required: true,
    },

    // Tenant-specific fields
    gender: { type: String },
    age: { type: Number },
    smoking: { type: Boolean, default: false },
    alcoholic: { type: Boolean, default: false },
    cleanlinessLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    noiseTolerance: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    sleepingHabit: {
      type: String,
      enum: ["Early sleeper", "Night owl"],
      default: "Early sleeper",
    },
    socialBehavior: {
      type: String,
      enum: ["Introvert", "Balanced", "Extrovert"],
      default: "Balanced",
    },
    preferredRoomType: {
      type: String,
      enum: ["Single", "Shared"],
      default: "Single",
    },
    preferredEnvironment: {
      type: String,
      enum: ["Quiet", "Moderate", "Lively"],
      default: "Quiet",
    },
    foodAllergies: { type: String },
    medicalConditions: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
