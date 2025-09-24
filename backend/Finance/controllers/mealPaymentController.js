// backend/Finance/controllers/mealPaymentController.js
const mongoose = require("mongoose");
const MealInvoice = require("../models/MealInvoice");
const MealPayment = require("../models/MealPayment");
const { getNextCode } = require("../models/codeHelper");
const { isValidMonth } = require("../utils/validators");

// ---------- Admin/Supplier: list invoices ----------
async function listMealInvoices(req, res) {
  try {
    const { month, status, supplierId } = req.query;
    const filter = {};
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      filter.month = month;
    }
    if (status) filter.status = status;
    if (supplierId) {
      try {
        filter.supplierId = new mongoose.Types.ObjectId(supplierId);
      } catch {
        return res.status(400).json({ message: "invalid supplierId" });
      }
    }

    const rows = await MealInvoice.find(filter).sort({ createdAt: -1 }).lean();
    res.json(rows);
  } catch (e) {
    console.error("listMealInvoices error:", e);
    res.status(500).json({ message: "Failed to fetch meal invoices" });
  }
}

// ---------- Admin: pay invoice (no partials) ----------
async function payMealInvoice(req, res) {
  try {
    const { invoiceId, paymentMethod, notes } = req.body || {};
    if (!invoiceId || !paymentMethod)
      return res.status(400).json({ message: "invoiceId, paymentMethod required" });

    const inv = await MealInvoice.findById(invoiceId);
    if (!inv) return res.status(404).json({ message: "Invoice not found" });
    if (inv.status === "paid") return res.status(400).json({ message: "Invoice already paid" });

    const paymentCode = await getNextCode("mealPayment", "MPMT", 3);
    const pay = await MealPayment.create({
      paymentCode,
      invoiceId: inv._id,
      supplierId: inv.supplierId,
      amountCents: inv.amountCents,
      paymentMethod,
      notes: notes || "",
    });

    inv.status = "paid";
    await inv.save();

    res.status(201).json({ ok: true, payment: pay, invoice: inv });
  } catch (e) {
    console.error("payMealInvoice error:", e);
    res.status(500).json({ message: "Failed to pay meal invoice" });
  }
}

// ---------- Admin/Supplier: list payments ----------
async function listMealPayments(req, res) {
  try {
    const { month, supplierId } = req.query;
    const match = {};
    if (supplierId) {
      try {
        match.supplierId = new mongoose.Types.ObjectId(supplierId);
      } catch {
        return res.status(400).json({ message: "invalid supplierId" });
      }
    }

    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      const payments = await MealPayment.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "mealinvoices",
            localField: "invoiceId",
            foreignField: "_id",
            as: "inv",
          },
        },
        { $unwind: "$inv" },
        { $match: { "inv.month": month } },
        { $sort: { createdAt: -1 } },
      ]);
      return res.json(payments);
    }

    const rows = await MealPayment.find(match).sort({ createdAt: -1 }).lean();
    res.json(rows);
  } catch (e) {
    console.error("listMealPayments error:", e);
    res.status(500).json({ message: "Failed to fetch meal payments" });
  }
}

module.exports = {
  listMealInvoices,
  payMealInvoice,
  listMealPayments,
};