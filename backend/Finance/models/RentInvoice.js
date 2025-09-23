// backend/Finance/models/RentInvoice.js
// 🔶 COLLECTION NAME: 'rentinvoices'
const mongoose = require("mongoose");

const RentInvoiceSchema = new mongoose.Schema(
  {
    // Human-friendly code shown in UI (e.g., INV001)
    invoiceCode: { type: String, required: true, unique: true, index: true },

    // 🔶 Align these ids to your team’s schema
    tenantId:   { type: mongoose.Types.ObjectId, ref: "users", required: true },
    propertyId: { type: mongoose.Types.ObjectId, ref: "properties", required: true },
    roomId:     { type: mongoose.Types.ObjectId, ref: "rooms", required: true },

    // YYYY-MM (string) for easy filtering
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },

    baseRent:     { type: Number, required: true, min: 0 },
    utilityShare: { type: Number, required: true, min: 0, default: 0 },
    mealCost:     { type: Number, required: true, min: 0, default: 0 },
    total:        { type: Number, required: true, min: 0 },

    status: { type: String, enum: ["pending", "paid"], default: "pending", index: true },

    dueDate: { type: Date, required: true },
  },
  { timestamps: true, collection: "rentinvoices" }
);

// helpful compound index for filters
RentInvoiceSchema.index({ month: 1, propertyId: 1, tenantId: 1 });

module.exports = mongoose.model("RentInvoice", RentInvoiceSchema);
