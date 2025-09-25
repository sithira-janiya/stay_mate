// backend/Finance/controllers/rentController.js
const mongoose = require("mongoose");
const RentInvoice = require("../models/RentInvoice");
const Payment = require("../models/Payment");
const { getNextCode } = require("../models/codeHelper");
const { isValidMonth, ensureObjectId } = require("../utils/validators");


const { Room, Order } = require("../models/ExternalModels");
const rentCalc = require("../services/rentCalc");

// ---------- helpers ----------
function yymm(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ---------- list invoices ----------
async function listInvoices(req, res) {
  try {
    const { propertyId, tenantId, month, status } = req.query;
    const filter = {};
    if (propertyId) filter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (tenantId)   filter.tenantId   = String(tenantId); // keep string
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      filter.month = month;
    }

    const raw = await RentInvoice.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "propertyId", select: "name" })
      .populate({ path: "roomId", select: "roomNo" })
      .lean();

    const today = new Date();
    const withDerived = raw.map((inv) => {
      const isPaid = inv.status === "paid";
      let derivedStatus = inv.status; // 'pending' or 'paid'
      if (!isPaid && inv.dueDate) {
        const dueOnly = new Date(inv.dueDate);
        const dueMidnight = new Date(dueOnly.getFullYear(), dueOnly.getMonth(), dueOnly.getDate());
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (dueMidnight < todayMidnight) derivedStatus = "overdue";
      }
      return {
        ...inv,
        derivedStatus,
        propertyName: inv.propertyId?.name,
        roomNumber: inv.roomId?.roomNo,
      };
    });

    let out = withDerived;
    if (status) {
      if (status === "unpaid") {
        out = withDerived.filter(
          (i) => i.derivedStatus === "pending" || i.derivedStatus === "overdue"
        );
      } else {
        out = withDerived.filter((i) => i.derivedStatus === status);
      }
    }

    return res.json(out);
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
    if (tenantId)   invFilter.tenantId   = String(tenantId);
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
    const { propertyId, month, dueDate } = req.body || {};

    // Month restriction: only last month or this month
    if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
    const now = new Date();
    const thisMonth = yymm(now);
    const lastMonth = yymm(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    if (month !== thisMonth && month !== lastMonth) {
      return res.status(400).json({ message: `month must be either ${lastMonth} or ${thisMonth}` });
    }

    // Due date restriction: only THIS month or NEXT month
    if (!dueDate) return res.status(400).json({ message: "dueDate required" });
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
      return res.status(400).json({ message: "Invalid dueDate" });
    }
    const firstOfThis = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfFollowing = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    if (!(due >= firstOfThis && due < firstOfFollowing)) {
      return res.status(400).json({
        message: `dueDate must be within ${firstOfThis.toISOString().slice(0, 10)} and ${new Date(
          firstOfFollowing - 1
        )
          .toISOString()
          .slice(0, 10)} (this month or next month)`,
      });
    }

    // 1) Rooms (optionally limited by property)
    const roomQuery = {};
    if (propertyId) roomQuery.property = ensureObjectId(propertyId) || propertyId;

    const rooms = await Room.find(roomQuery, {
      _id: 1,
      property: 1,
      occupants: 1, // embedded [{ _id: String }]
      price: 1,     // { amount }
    }).lean();

    // 2) Build per-tenant assignments
    const assignments = rentCalc.buildAssignmentsFromRooms(rooms);
    if (!assignments.length) {
      return res.status(200).json({ createdCount: 0, invoices: [], message: "No occupants found" });
    }

    // 3) Utilities for the month, by property
    const propertyIdSet = new Set(assignments.map(a => String(a.propertyId)));
    const utilitiesByProperty = await rentCalc.getUtilitiesByProperty({ month, propertyIds: propertyIdSet });

    // 4) Tenants per property for utility splitting
    const tenantsByProperty = rentCalc.mapTenantsByProperty(assignments);

    // 5) Meals by tenant (DELIVERED only) within the month
    const mealsByTenant = await rentCalc.getMealCostByTenant({ OrderModel: Order, month });

    // 6) Compute final totals
    const computed = rentCalc.computeAmounts({
      assignments,
      utilitiesByProperty,
      tenantsByProperty,
      mealsByTenant,
    });

    // 7) Create invoices, skipping duplicates (tenantId + month)
    let createdCount = 0;
    const results = [];

    for (const a of computed) {
      const tKey = a.tenantId;

      const existing = await RentInvoice.findOne({ tenantId: tKey, month }).lean();
      if (existing) { results.push(existing); continue; }

      const invoiceCode = await getNextCode("rentInvoice", "RINV", 4);
      const newInv = await RentInvoice.create({
        invoiceCode,
        tenantId: tKey,
        propertyId: a.propertyId,
        roomId: a.roomId,
        month,
        baseRent: a.baseRent,
        utilityShare: a.utilityShare,
        mealCost: a.mealCost,
        total: a.total,
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

// ---------- delete invoice ----------
async function deleteInvoice(req, res) {
  try {
    const _id = ensureObjectId(req.params.id);
    if (!_id) return res.status(400).json({ message: "Invalid invoice id" });

    const inv = await RentInvoice.findById(_id);
    if (!inv) return res.status(404).json({ message: "Invoice not found" });

    if (inv.status === "paid") {
      return res.status(400).json({ message: "Cannot delete a paid invoice" });
    }
    const hasPayment = await Payment.exists({ invoiceId: _id });
    if (hasPayment) {
      return res.status(400).json({ message: "Cannot delete invoice with recorded payment" });
    }

    await RentInvoice.deleteOne({ _id });
    return res.status(204).send();
  } catch (err) {
    console.error("deleteInvoice error:", err);
    return res.status(500).json({ message: "Failed to delete invoice" });
  }
}

module.exports = {
  listInvoices,
  listPayments,
  generateInvoices,
  createReceipt,
  deleteInvoice,
};
