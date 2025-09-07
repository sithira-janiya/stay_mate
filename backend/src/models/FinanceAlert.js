const mongoose = require('mongoose');

const financeAlertSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    ref: 'Tenant'
  },
  date: {
    type: String,
    default: null
  },
  month: {
    type: String,
    default: null
  },
  reason: {
    type: String,
    enum: ['Overuse', 'NoCheckInBy10AM'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FinanceAlert', financeAlertSchema);