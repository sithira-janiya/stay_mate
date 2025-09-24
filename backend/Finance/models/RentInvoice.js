// backend/Finance/models/RentInvoice.js
const mongoose = require("mongoose");

const RentInvoiceSchema = new mongoose.Schema(
  {
    // Human-friendly sequential code (INV001, etc.)
    invoiceCode: { type: String, required: true, unique: true, index: true },

    // IMPORTANT: keep types aligned with your teammates' models
    // - tenantId is a STRING (matches embedded occupant _id from Room)
    // - propertyId references Property
    // - roomId references Room
    tenantId:   { type: String, required: true, index: true },
    propertyId: { type: mongoose.Types.ObjectId, ref: "Property", required: true },
    roomId:     { type: mongoose.Types.ObjectId, ref: "Room",     required: true },

    // YYYY-MM string, easy to query
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },

    baseRent:     { type: Number, required: true, min: 0 },
    utilityShare: { type: Number, required: true, min: 0, default: 0 },
    mealCost:     { type: Number, required: true, min: 0, default: 0 },
    total:        { type: Number, required: true, min: 0 },

    // We compute "overdue" in the UI based on dueDate if needed; DB stores pending/paid.
    status:  { type: String, enum: ["pending", "paid"], default: "pending", index: true },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true, collection: "rentinvoices" }
);

// Help typical filters
RentInvoiceSchema.index({ month: 1, propertyId: 1, tenantId: 1 });

// Hard guard against duplicate invoices for the same tenant, property, and month
RentInvoiceSchema.index(
  { tenantId: 1, propertyId: 1, month: 1 },
  { unique: true, name: "uniq_tenant_property_month" }
);

// Optionally ensure total = baseRent + utilityShare + mealCost (kept lenient)
RentInvoiceSchema.pre("validate", function (next) {
  if (this.baseRent != null && this.utilityShare != null && this.mealCost != null) {
    const sum = Number(this.baseRent || 0) + Number(this.utilityShare || 0) + Number(this.mealCost || 0);
    if (this.total == null) this.total = sum;
  }
  next();
});

module.exports = mongoose.model("RentInvoice", RentInvoiceSchema);
