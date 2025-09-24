// backend/Finance/models/RentInvoice.js
const mongoose = require("mongoose");

const RentInvoiceSchema = new mongoose.Schema(
  {
    invoiceCode: { type: String, required: true, unique: true, index: true },

    // Match team schemas
    tenantId:   { type: String, required: true }, // userId is a string in your DB
    propertyId: { type: mongoose.Types.ObjectId, ref: "Property", required: true },
    roomId:     { type: mongoose.Types.ObjectId, ref: "Room", required: true },

    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },

    baseRent:     { type: Number, required: true, min: 0 },
    utilityShare: { type: Number, required: true, min: 0, default: 0 },
    mealCost:     { type: Number, required: true, min: 0, default: 0 },
    total:        { type: Number, required: true, min: 0 },

    status:  { type: String, enum: ["pending", "paid"], default: "pending", index: true },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true, collection: "rentinvoices" }
);

RentInvoiceSchema.index({ month: 1, propertyId: 1, tenantId: 1 });

module.exports = mongoose.model("RentInvoice", RentInvoiceSchema);