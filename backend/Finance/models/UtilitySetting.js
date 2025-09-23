// backend/Finance/models/UtilitySetting.js
const mongoose = require("mongoose");

const utilitySettingSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // YYYY-MM
    waterAmount: { type: Number, min: 0, default: 0 },
    electricityAmount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

utilitySettingSchema.index({ propertyId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("UtilitySetting", utilitySettingSchema);
