// backend/Finance/controllers/financeReportController.js
const FinanceReport  = require('../models/FinanceReport');
const RentInvoice    = require('../models/RentInvoice');
const UtilityBill    = require('../models/UtilityBill');
const UtilityPayment = require('../models/UtilityPayment');
const MealInvoice    = require('../models/MealInvoice');

// Generate
async function generateFinanceReport(req, res) {
  try {
    const { reportType, month, notes } = req.body;
    const data = {};

    if (reportType === 'rent') {
      data.invoices = await RentInvoice.find({ month });
    } else if (reportType === 'utilities') {
      data.bills = await UtilityBill.find({ month });
      data.payments = await UtilityPayment.find({ month });
    } else if (reportType === 'meals') {
      data.invoices = await MealInvoice.find({ month });
    } else if (reportType === 'summary') {
      data.rent = await RentInvoice.find({ month });
      data.utilities = await UtilityPayment.find({ month });
      data.meals = await MealInvoice.find({ month });
    }

    const report = new FinanceReport({
      reportType,
      month,
      generatedBy: req.user?._id || null,
      data,
      notes: notes || ''
    });

    await report.save();
    res.status(201).json(report);
  } catch (err) {
    console.error('generateFinanceReport error:', err);
    res.status(500).json({ message: err.message });
  }
}

// List
async function listFinanceReports(req, res) {
  try {
    const { month, reportType } = req.query;
    const q = {};
    if (month) q.month = month;
    if (reportType) q.reportType = reportType;
    const reports = await FinanceReport.find(q).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('listFinanceReports error:', err);
    res.status(500).json({ message: err.message });
  }
}

// Get one
async function getFinanceReport(req, res) {
  try {
    const report = await FinanceReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json(report);
  } catch (err) {
    console.error('getFinanceReport error:', err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  generateFinanceReport,
  listFinanceReports,
  getFinanceReport,
};