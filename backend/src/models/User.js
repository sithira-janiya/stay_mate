const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nic: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, required: true },

    // Tenant-only fields
    gender: { type: String },
    age: { type: Number },
    smoking: { type: Boolean },
    alcoholic: { type: Boolean },
    cleanlinessLevel: { type: String },
    noiseTolerance: { type: String },
    sleepingHabit: { type: String },
    socialBehavior: { type: String },
    preferredRoomType: { type: String },
    preferredEnvironment: { type: String },
    foodAllergies: { type: String },
    medicalConditions: { type: String },

    // You can add more fields for other roles later here
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
