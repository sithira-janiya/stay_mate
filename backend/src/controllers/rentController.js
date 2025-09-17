import mongoose from "mongoose";
import RentInvoice from "../models/RentInvoice.js";
import Payment from "../models/Payment.js";
import { getNextCode } from "../models/codeHelper.js";


// Loose models into the team's collections
import { User, Room, Order, UtilitySetting } from "../models/ExternalModels.js";



// ---------- helpers ----------
function monthToRange(yyyyMM) {
  const [y, m] = yyyyMM.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0)); // exclusive
  return { start, end };
}
function isValidMonth(s) { return /^\d{4}-\d{2}$/.test(s); }
function ensureObjectId(v) { try { return new mongoose.Types.ObjectId(v); } catch { return null; } }

// ---------- list invoices ----------
export async function listInvoices(req, res) {
  try {
    const { propertyId, tenantId, month } = req.query;
    const filter = {};
    if (propertyId) filter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (tenantId)   filter.tenantId   = ensureObjectId(tenantId)   || tenantId;
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
export async function listPayments(req, res) {
  try {
    const { propertyId, tenantId, month } = req.query;

    // First find invoices that match filters
    const invFilter = {};
    if (propertyId) invFilter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (tenantId)   invFilter.tenantId   = ensureObjectId(tenantId)   || tenantId;
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      invFilter.month = month;
    }
    const invs = await RentInvoice.find(invFilter, { _id: 1 }).lean();
    const invIds = invs.map(i => i._id);
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
export async function generateInvoices(req, res) {
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

    // --- 1) Determine active tenants & their property/room + base rent ---
    // 🔶 This section depends on how your team marks occupancy.
    // Try #1: Room has tenant field(s): tenantId or occupantId
    const occupiedRooms = await Room.find(
      {
        // If your schema has status/active, filter it here.
        // Example: { isOccupied: true }
      },
      {
        _id: 1,
        propertyId: 1,       // 🔶 ensure your rooms have propertyId (ObjectId → properties)
        tenantId: 1,         // 🔶 or 'occupantId' or an array 'tenants'
        baseRent: 1          // 🔶 rename if your schema uses another field (e.g., 'rent')
      }
    ).lean();

    // Build a list of tenant assignments we can invoice
    const assignments = [];
    for (const r of occupiedRooms) {
      // Try multiple fields for tenant id: tenantId / occupantId / tenants[0]
      const tId = r.tenantId || r.occupantId || (Array.isArray(r.tenants) ? r.tenants[0] : null);
      if (!tId) continue;

      // 🔶 If base rent is stored elsewhere (e.g., on property/room type), adjust here.
      const baseRent = Number(r.baseRent || 0);

      assignments.push({
        tenantId: tId,
        propertyId: r.propertyId,
        roomId: r._id,
        baseRent
      });
    }

    if (!assignments.length) {
      return res.status(200).json({ createdCount: 0, invoices: [], message: "No occupied rooms found" });
    }

    // Group tenants per property to compute utility share
    const tenantsByProperty = new Map(); // propertyId -> Set(tenantId)
    for (const a of assignments) {
      const key = String(a.propertyId);
      if (!tenantsByProperty.has(key)) tenantsByProperty.set(key, new Set());
      tenantsByProperty.get(key).add(String(a.tenantId));
    }

    // --- 2) Compute utilities per property for the month ---
    // 🔶 If your team stores monthly totals differently, adapt this query.
    // We'll assume utilitysettings has docs like { propertyId, month: "YYYY-MM", waterAmount, electricityAmount }
    const utilities = await UtilitySetting.find({ month }).lean();
    const utilMap = new Map(); // propertyId -> total amount for month
    for (const u of utilities) {
      const total = Number(u.waterAmount || 0) + Number(u.electricityAmount || 0);
      utilMap.set(String(u.propertyId), total);
    }

    // --- 3) Compute meal totals per tenant for the month ---
    // 🔶 If meals are in 'meals' instead of 'orders', switch model at ExternalModels.js
    // Assume orders have { tenantId, propertyId, createdAt, total } or {amount}
    const orders = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$tenantId", // 🔶 adjust field to your tenant reference in orders
          total: { $sum: { $toDouble: "$total" } } // 🔶 or "$amount"
        }
      }
    ]);
    const mealsMap = new Map(); // tenantId -> total
    for (const o of orders) mealsMap.set(String(o._id), Number(o.total || 0));

    // --- 4) Create invoices (skip if one already exists for tenant+month) ---
    const results = [];
    let createdCount = 0;

    for (const a of assignments) {
      const tIdStr = String(a.tenantId);
      const pIdStr = String(a.propertyId);

      // Find tenant count for this property for share calculation
      const tenantCount = tenantsByProperty.get(pIdStr)?.size || 1;
      const propertyTotalUtil = utilMap.get(pIdStr) || 0;
      const utilityShare = tenantCount ? Math.round(propertyTotalUtil / tenantCount) : 0;

      const mealCost = Math.round(mealsMap.get(tIdStr) || 0);
      const baseRent = Math.round(Number(a.baseRent || 0));
      const total = baseRent + utilityShare + mealCost;

      // Upsert rule: one invoice per (tenantId, month)
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
        dueDate: due
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

// ---------- create receipt (no partials) ----------
export async function createReceipt(req, res) {
  try {
    const { invoiceId, amountPaid, paymentMethod } = req.body || {};
    if (!invoiceId || amountPaid == null || !paymentMethod) {
      return res.status(400).json({ message: "invoiceId, amountPaid, paymentMethod required" });
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
      paymentDate: new Date()
    });

    inv.status = "paid";
    await inv.save();

    return res.status(201).json({ payment: pay, invoice: inv });
  } catch (err) {
    console.error("createReceipt error:", err);
    return res.status(500).json({ message: "Failed to create receipt" });
  }
}
