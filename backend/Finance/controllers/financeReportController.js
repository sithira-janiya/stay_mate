// backend/Finance/controllers/financeReportController.js
const FinanceReport   = require('../models/FinanceReport');
const RentInvoice     = require('../models/RentInvoice');
const UtilityBill     = require('../models/UtilityBill');
const UtilityPayment  = require('../models/UtilityPayment');
const Order           = require('../../Tenant/Models/Order'); // Meals cost from Orders (DELIVERED)
const { getNextCode } = require('../models/codeHelper');
const { ensureObjectId } = require('../utils/validators');

// ---------- helpers ----------
function isValidMonthStr(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}$/.test(s);
}
function isFutureMonth(s) {
  if (!isValidMonthStr(s)) return true;
  const [yy, mm] = s.split('-').map(Number);
  const first = new Date(yy, mm - 1, 1);
  const today = new Date();
  const cur = new Date(today.getFullYear(), today.getMonth(), 1);
  return first > cur;
}
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : 0; }
/** Given "YYYY-MM" -> { start, end } UTC boundaries for Mongo queries */
function monthToRange(yyyyMM) {
  const [y, m] = yyyyMM.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end   = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
}
/** Sum delivered Orders in the month and return rupees (rounded) */
async function getTotalMealCostFromOrders(month) {
  const { start, end } = monthToRange(month);
  const agg = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: 'DELIVERED' } },
    { $group: { _id: null, totalCents: { $sum: '$totalCents' } } },
  ]);
  const cents = num(agg?.[0]?.totalCents);
  return Math.round(cents / 100);
}

// ---------- controllers ----------
async function generateFinanceReport(req, res) {
  try {
    const { reportType = 'summary', month, notes = '' } = req.body || {};

    // Validation
    if (!isValidMonthStr(month)) {
      return res.status(400).json({ message: 'month must be in YYYY-MM format' });
    }
    if (isFutureMonth(month)) {
      return res.status(400).json({ message: 'month cannot be in the future' });
    }

    // Duplicate check (unique by type+month)
    const existing = await FinanceReport.findOne({ reportType, month }).lean();
    if (existing) {
      return res.status(400).json({ message: 'report for this month has already been created' });
    }

    const data = {};

    if (reportType === 'rent') {
      data.invoices = await RentInvoice.find({ month }).lean();
    } else if (reportType === 'utilities') {
      data.bills    = await UtilityBill.find({ month }).lean();
      data.payments = await UtilityPayment.find({ month }).lean();
    } else if (reportType === 'meals') {
      const totalMealCost = await getTotalMealCostFromOrders(month);
      data.ordersSummary = { totalMealCost };
    } else if (reportType === 'summary') {
      // Fetch raw data
      data.rent            = await RentInvoice.find({ month }).lean();
      data.utilityBills    = await UtilityBill.find({ month }).lean();
      data.utilityPayments = await UtilityPayment.find({ month }).lean();
      const totalMealCost  = await getTotalMealCostFromOrders(month);

      // Totals
      const totalBaseRentIncome = (data.rent || []).reduce((s, r) => s + num(r.baseRent), 0);
      const totalWaterCost = (data.utilityBills || [])
        .filter(b => String(b.type).toLowerCase() === 'water')
        .reduce((s, b) => s + num(b.amount), 0);
      const totalElectricityCost = (data.utilityBills || [])
        .filter(b => String(b.type).toLowerCase() === 'electricity')
        .reduce((s, b) => s + num(b.amount), 0);

      // Profit before tax
      const preTaxProfit = totalBaseRentIncome - (totalWaterCost + totalElectricityCost + totalMealCost);

      // 6% income tax on positive pre-tax profit only
      const incomeTax = preTaxProfit > 0 ? Math.round(preTaxProfit * 0.06) : 0;

      // Spendings include tax
      const totalSpendings = totalWaterCost + totalElectricityCost + totalMealCost + incomeTax;

      // Profit after tax
      const profit = totalBaseRentIncome - totalSpendings;

      data.totals = {
        totalBaseRentIncome,
        totalWaterCost,
        totalElectricityCost,
        totalMealCost,
        incomeTax,          // ⬅️ new
        totalSpendings,
        profit,
      };
    } else {
      return res.status(400).json({ message: 'Invalid reportType' });
    }

    // Human-readable report code
    const reportCode = await getNextCode('financeReport', 'FREP', 4);

    const report = new FinanceReport({
      reportCode,
      reportType,
      month,
      generatedBy: req.user?._id || null,
      data,
      notes,
    });

    await report.save();
    return res.status(201).json(report);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({ message: 'report for this month has already been created' });
    }
    console.error('generateFinanceReport error:', err);
    return res.status(500).json({ message: 'Failed to generate finance report' });
  }
}

async function listFinanceReports(req, res) {
  try {
    const { month, reportType } = req.query;
    const q = {};
    if (month) q.month = month;
    if (reportType) q.reportType = reportType;

    const reports = await FinanceReport.find(q).sort({ createdAt: -1 }).lean();
    return res.json(reports);
  } catch (err) {
    console.error('listFinanceReports error:', err);
    return res.status(500).json({ message: 'Failed to fetch reports' });
  }
}

async function getFinanceReport(req, res) {
  try {
    const idOrCode = req.params.id;
    const asId = ensureObjectId(idOrCode);

    const report = asId
      ? await FinanceReport.findById(asId).lean()
      : await FinanceReport.findOne({ reportCode: idOrCode }).lean();

    if (!report) return res.status(404).json({ message: 'Not found' });
    return res.json(report);
  } catch (err) {
    console.error('getFinanceReport error:', err);
    return res.status(500).json({ message: 'Failed to fetch report' });
  }
}

module.exports = {
  generateFinanceReport,
  listFinanceReports,
  getFinanceReport,
};
