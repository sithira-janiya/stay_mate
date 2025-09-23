// backend/Finance/controllers/rentController.js
const mongoose = require("mongoose");
const RentInvoice = require("../models/RentInvoice");
const Payment = require("../models/Payment");
const { getNextCode } = require("../models/codeHelper");
const { isValidMonth, ensureObjectId } = require("../utils/validators");

const { User, Room, Order /* , UtilitySetting */ } = require("../models/ExternalModels");

// ---------- helpers ----------
function monthToRange(yyyyMM) {
  const [y, m] = yyyyMM.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
}

// ---------- list invoices ----------
async function listInvoices(req, res) {
  try {
    const { propertyId, tenantId, month } = req.query;
    const filter = {};
    if (propertyId) filter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (tenantId) filter.tenantId = ensureObjectId(tenantId) || tenantId;
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      filter.month = month;
    }
    const invoices = await RentInvoice.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(invoices);
  } catch (err) {
    console.error("listInvoices error:", err);
    return res.status(500).json({ message: "Failed to fetch invoices" });
  }
}

// ---------- list payments ----------
async function listPayments(req, res) {
  try {
    const { propertyId, tenantId, month } = req.query;
    const invFilter = {};
    if (propertyId) invFilter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (tenantId) invFilter.tenantId = ensureObjectId(tenantId) || tenantId;
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      invFilter.month = month;
    }

    const invs = await RentInvoice.find(invFilter, { _id: 1 }).lean();
    const invIds = invs.map((i) => i._id);
    if (!invIds.length) return res.json([]);

    const pays = await Payment.find({ invoiceId: { $in: invIds } })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(pays);
  } catch (err) {
    console.error("listPayments error:", err);
    return res.status(500).json({ message: "Failed to fetch payments" });
  }
}

// ---------- generate invoices ----------
async function generateInvoices(req, res) {
  try {
    const { month, dueDate } = req.body || {};
    if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
    if (!dueDate) return res.status(400).json({ message: "dueDate required" });

    const today = new Date();
    const due = new Date(dueDate);
    if (due < new Date(today.toDateString())) {
      return res.status(400).json({ message: "dueDate cannot be in the past" });
    }

    const { start, end } = monthToRange(month);
    const rooms = await Room.find(
      { isActive: true },
      { _id: 1, propertyId: 1, occupants: 1, baseRent: 1 }
    ).lean();

    const assignments = [];
    for (const r of rooms) {
      const occ = Array.isArray(r.occupants) ? r.occupants : [];
      for (const tId of occ) {
        assignments.push({
          tenantId: tId,
          propertyId: r.propertyId,
          roomId: r._id,
          baseRent: Number(r.baseRent || 0),
        });
      }
    }

    if (!assignments.length) {
      return res
        .status(200)
        .json({ createdCount: 0, invoices: [], message: "No occupants found in active rooms" });
    }

    const tenantsByProperty = new Map();
    for (const a of assignments) {
      const pKey = String(a.propertyId);
      if (!tenantsByProperty.has(pKey)) tenantsByProperty.set(pKey, new Set());
      tenantsByProperty.get(pKey).add(String(a.tenantId));
    }

    const utilMap = new Map(); // TODO: connect Utility model later
    const orders = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$userId", totalCents: { $sum: "$totalCents" } } },
    ]);

    const mealsMap = new Map();
    for (const o of orders) {
      const rupees = Math.round(Number(o.totalCents || 0) / 100);
      mealsMap.set(String(o._id), rupees);
    }

    let createdCount = 0;
    const results = [];

    for (const a of assignments) {
      const pKey = String(a.propertyId);
      const tKey = String(a.tenantId);

      const propertyTotalUtil = utilMap.get(pKey) || 0;
      const tenantCount = tenantsByProperty.get(pKey)?.size || 1;
      const utilityShare = Math.round(propertyTotalUtil / tenantCount);

      const mealCost = Math.round(mealsMap.get(tKey) || 0);
      const baseRent = Math.round(Number(a.baseRent || 0));
      const total = baseRent + utilityShare + mealCost;

      const existing = await RentInvoice.findOne({ tenantId: a.tenantId, month }).lean();
      if (existing) {
        results.push(existing);
        continue;
      }

      const invoiceCode = await getNextCode("invoice", "INV", 3);
      const newInv = await RentInvoice.create({
        invoiceCode,
        tenantId: a.tenantId,
        propertyId: a.propertyId,
        roomId: a.roomId,
        month,
        baseRent,
        utilityShare,
        mealCost,
        total,
        status: "pending",
        dueDate: due,
      });

      results.push(newInv.toObject());
      createdCount++;
    }

    return res.status(200).json({ createdCount, invoices: results });
  } catch (err) {
    console.error("generateInvoices error:", err);
    return res.status(500).json({ message: "Failed to generate invoices" });
  }
}

// ---------- create receipt ----------
async function createReceipt(req, res) {
  try {
    const { invoiceId, amountPaid, paymentMethod } = req.body || {};
    if (!invoiceId || amountPaid == null || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "invoiceId, amountPaid, paymentMethod required" });
    }

    const inv = await RentInvoice.findById(invoiceId);
    if (!inv) return res.status(404).json({ message: "Invoice not found" });
    if (inv.status === "paid") return res.status(400).json({ message: "Invoice already paid" });

    const amt = Number(amountPaid);
    if (amt !== Number(inv.total)) {
      return res.status(400).json({ message: "Partial payments are not allowed" });
    }

    const paymentCode = await getNextCode("payment", "PMT", 3);
    const pay = await Payment.create({
      paymentCode,
      invoiceId: inv._id,
      amountPaid: amt,
      paymentMethod,
      paymentDate: new Date(),
    });

    inv.status = "paid";
    await inv.save();

    return res.status(201).json({ payment: pay, invoice: inv });
  } catch (err) {
    console.error("createReceipt error:", err);
    return res.status(500).json({ message: "Failed to create receipt" });
  }
}

module.exports = {
  listInvoices,
  listPayments,
  generateInvoices,
  createReceipt,
};
