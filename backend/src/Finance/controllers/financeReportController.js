import FinanceReport from "../models/FinanceReport.js";
import RentInvoice from "../models/RentInvoice.js";
import UtilityBill from "../models/UtilityBill.js";
import UtilityPayment from "../models/UtilityPayment.js";
// MealInvoice is optional for now—guard its usage if not present
let MealInvoice = null;
try {
  const mod = await import("../models/MealInvoice.js");
  MealInvoice = mod.default || mod;
} catch { /* not implemented yet; handled below */ }

// If you already have these helpers in Finance/utils/validators.js, import them.
// Otherwise, light in-file helpers:
const isValidMonth = (s) => /^\d{4}-\d{2}$/.test(s);

// ---------- Helpers to compute totals ----------
async function totalRentByMonth(month) {
  // sum invoice.total (whatever field you use for grand total)
  const res = await RentInvoice.aggregate([
    { $match: month ? { month } : {} },
    { $group: { _id: null, sum: { $sum: { $toDouble: "$total" } } } },
  ]);
  return res[0]?.sum || 0;
}

async function totalUtilitiesByMonth(month) {
  // We use *payments* as the actual expense (amountPaid). If you prefer bills, switch model/field.
  const res = await UtilityPayment.aggregate([
    { $match: month ? { month } : {} },
    { $group: { _id: null, sum: { $sum: { $toDouble: "$amountPaid" } } } },
  ]);
  return res[0]?.sum || 0;
}

async function totalMealsByMonth(month) {
  if (!MealInvoice) return 0; // meal module not wired yet
  const res = await MealInvoice.aggregate([
    { $match: month ? { month } : {} },
    { $group: { _id: null, sum: { $sum: { $toDouble: "$total" } } } }, // adjust field if different
  ]);
  return res[0]?.sum || 0;
}

// ---------- Generate a finance report ----------
export async function generateFinanceReport(req, res) {
  try {
    const { reportType, month, notes } = req.body || {};

    if (month && !isValidMonth(month)) {
      return res.status(400).json({ message: "month must be YYYY-MM" });
    }
    if (!reportType || !["rent", "utilities", "meals", "summary"].includes(reportType)) {
      return res.status(400).json({ message: "reportType must be one of rent/utilities/meals/summary" });
    }

    // Compute totals per type
    let totals = { rent: 0, utilities: 0, meals: 0, grand: 0 };
    let data = {};

    if (reportType === "rent") {
      totals.rent = await totalRentByMonth(month);
      totals.grand = totals.rent;
      const invoices = await RentInvoice.find(month ? { month } : {}).select("_id invoiceCode month total status").lean();
      data = { count: invoices.length, sum: totals.rent, sample: invoices.slice(0, 50) };
    } else if (reportType === "utilities") {
      // Use payments as actual cash out. If you also want unpaid bills, you can include them in `data.misc`.
      totals.utilities = await totalUtilitiesByMonth(month);
      totals.grand = totals.utilities;
      const payments = await UtilityPayment.find(month ? { month } : {}).select("_id paymentCode month amountPaid paymentMethod").lean();
      data = { count: payments.length, sum: totals.utilities, sample: payments.slice(0, 50) };

      // Optionally include unpaid bills snapshot (not counted in totals)
      const unpaidBills = await UtilityBill.countDocuments({ ...(month ? { month } : {}), status: "unpaid" });
      data.misc = { unpaidBills };
    } else if (reportType === "meals") {
      totals.meals = await totalMealsByMonth(month);
      totals.grand = totals.meals;

      if (MealInvoice) {
        const invoices = await MealInvoice.find(month ? { month } : {}).select("_id invoiceCode month total status").lean();
        data = { count: invoices.length, sum: totals.meals, sample: invoices.slice(0, 50) };
      } else {
        data = { count: 0, sum: 0, note: "Meal module not implemented yet" };
      }
    } else {
      // summary
      totals.rent = await totalRentByMonth(month);
      totals.utilities = await totalUtilitiesByMonth(month);
      totals.meals = await totalMealsByMonth(month);
      totals.grand = totals.rent + totals.utilities + totals.meals;
      data = {
        rent: { sum: totals.rent },
        utilities: { sum: totals.utilities },
        meals: { sum: totals.meals, note: MealInvoice ? undefined : "Meal module not implemented yet" },
      };
    }

    const doc = await FinanceReport.create({
      type: reportType,
      month: month || null,
      totals,
      generatedBy: req.user?._id || null,
      data,
      notes: notes || "",
      generatedAt: new Date(),
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("generateFinanceReport error:", err);
    return res.status(500).json({ message: "Failed to generate report" });
  }
}

// ---------- List finance reports ----------
export async function listFinanceReports(req, res) {
  try {
    const { month, reportType } = req.query || {};
    const q = {};
    if (month) q.month = month;
    if (reportType) q.type = reportType;

    const rows = await FinanceReport.find(q)
      .sort({ generatedAt: -1, createdAt: -1 })
      .select("_id type month totals generatedAt createdAt")
      .lean();

    return res.json(rows);
  } catch (err) {
    console.error("listFinanceReports error:", err);
    return res.status(500).json({ message: "Failed to fetch finance reports" });
  }
}

// ---------- Get one finance report ----------
export async function getFinanceReport(req, res) {
  try {
    const { id } = req.params;
    const row = await FinanceReport.findById(id).lean();
    if (!row) return res.status(404).json({ message: "Not found" });
    return res.json(row);
  } catch (err) {
    console.error("getFinanceReport error:", err);
    return res.status(500).json({ message: "Failed to fetch finance report" });
  }
}
