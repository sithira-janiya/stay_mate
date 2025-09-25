// backend/Finance/models/FinanceReport.js
const mongoose = require('mongoose');

const financeReportSchema = new mongoose.Schema(
  {
    reportCode: { type: String, required: true, unique: true }, // human-readable code e.g., FREP-0001
    reportType: { type: String, enum: ['rent', 'utilities', 'meals', 'summary'], required: true },
    month: { type: String, match: /^\d{4}-\d{2}$/, required: true }, // "YYYY-MM"
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Uniqueness: one report per type+month
financeReportSchema.index({ reportType: 1, month: 1 }, { unique: true });

// Virtual "generatedAt" for UI parity
financeReportSchema.virtual('generatedAt').get(function () {
  return this.createdAt;
});
financeReportSchema.set('toJSON', { virtuals: true });
financeReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FinanceReport', financeReportSchema);
