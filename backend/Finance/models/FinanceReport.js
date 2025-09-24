const mongoose = require('mongoose');

const financeReportSchema = new mongoose.Schema(
  {
    reportCode: { type: String }, // optional, if you want codes
    reportType: { type: String, enum: ['rent', 'utilities', 'meals', 'summary'], required: true },
    month: { type: String, match: /^\d{4}-\d{2}$/ }, // "YYYY-MM"
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // holds invoices/bills/payments/etc.
    notes: { type: String, default: '' },
  },
  { timestamps: true } // creates createdAt (your UI shows it as "Generated At")
);

// If your UI expects `generatedAt`, you can virtual-map it to createdAt:
financeReportSchema.virtual('generatedAt').get(function () {
  return this.createdAt;
});
financeReportSchema.set('toJSON', { virtuals: true });
financeReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FinanceReport', financeReportSchema);