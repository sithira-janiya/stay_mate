// backend/Finance/controllers/utilityController.js
const UtilityBill     = require("../models/UtilityBill");
const UtilityPayment  = require("../models/UtilityPayment");
const { getNextCode } = require("../models/codeHelper");
const { ensureObjectId, isValidMonth } = require("../utils/validators");

// ---------- list bills ----------
async function listUtilityBills(req, res) {
  try {
    const { propertyId, month, type, status, billId } = req.query;
    const filter = {};
    if (billId) {
  const trimmed = String(billId).trim();
  const oid = ensureObjectId(trimmed);
  if (oid) {
    filter._id = oid;
  } else {
  
    filter.billCode = { $regex: `^${trimmed}$`, $options: "i" };
  }
}

    if (propertyId) filter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      filter.month = month;
    }
    if (type) filter.type = type;
    if (status) filter.status = status;

    const docs = await UtilityBill.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "propertyId", select: "name" })
      .lean();

    // compute 'overdue' on the fly if not paid
    const today = new Date();
    const out = docs.map(d => {
      if (d.status === "paid") return d;
      const overdue = d.dueDate && new Date(dueDateOnly(d.dueDate)) < new Date(today.toDateString());
      return { ...d, status: overdue ? "overdue" : "unpaid" };
    });

    return res.json(out);
  } catch (e) {
    console.error("listUtilityBills error:", e);
    return res.status(500).json({ message: "Failed to fetch utility bills" });
  }
}

function dueDateOnly(dt) {
  const x = new Date(dt);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}

// ---------- create bill ----------
async function createUtilityBill(req, res) {
  try {
    let {
      propertyId,
      month,
      type,
      amount,
      dueDate,
      billImageUrl = "",
      notes = "",
    } = req.body || {};

    if (!propertyId || !month || !type || amount == null || !dueDate) {
      return res.status(400).json({ message: "propertyId, month, type, amount, dueDate required" });
    }

    // normalize + basic validation
    type = String(type).toLowerCase();
    if (!["water", "electricity"].includes(type)) {
      return res.status(400).json({ message: "type must be 'water' or 'electricity'" });
    }
    if (!isValidMonth(month)) {
      return res.status(400).json({ message: "month must be YYYY-MM" });
    }
    if (Number(amount) < 0) {
      return res.status(400).json({ message: "amount cannot be negative" });
    }

    // --- Enforce month window: only this month OR last month ---
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
    if (month !== thisMonth && month !== lastMonth) {
      return res.status(400).json({ message: `month must be either ${lastMonth} or ${thisMonth}` });
    }

    // --- Enforce dueDate >= first day of current month ---
    const due = new Date(dueDate);
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    if (isNaN(due.getTime())) {
      return res.status(400).json({ message: "Invalid dueDate" });
    }
    if (due < firstDayThisMonth) {
      return res.status(400).json({
        message: `dueDate cannot be before ${firstDayThisMonth.toISOString().slice(0, 10)}`
      });
    }

    // --- Duplicate check: propertyId + month + type must be unique ---
    const propId = ensureObjectId(propertyId) || propertyId;
    const exists = await UtilityBill.findOne({ propertyId: propId, month, type }).lean();
    if (exists) {
      return res.status(409).json({
        message: `A ${type} bill already exists for this property in ${month}.`
      });
    }

    // Human-readable sequential code
    const isWater   = type === "water";
    const counterId = isWater ? "utilityBill_water" : "utilityBill_electricity";
    const prefix    = isWater ? "UBW" : "UBE";
    const billCode  = await getNextCode(counterId, prefix, 4);

    const bill = await UtilityBill.create({
      billCode,
      propertyId: propId,
      month,
      type,
      amount: Number(amount),
      dueDate: due,
      billImageUrl,
      notes,
      status: "unpaid",
    });

    return res.status(201).json(bill);
  } catch (e) {
    if (e?.code === 11000) {
      // if you also add a unique index on {propertyId, month, type} this will catch race conditions
      return res.status(409).json({ message: "A bill for this property/month/type already exists." });
    }
    console.error("createUtilityBill error:", e);
    return res.status(500).json({ message: "Failed to create utility bill" });
  }
}


async function payUtilityBill(req, res) {
  try {
    const id = req.params.id || req.body?.billId;
    const { paymentMethod = "Cash" } = req.body || {};

    if (!id) return res.status(400).json({ message: "billId required" });

    const _id = ensureObjectId(id);
    if (!_id) return res.status(400).json({ message: "Invalid billId" });

    const bill = await UtilityBill.findById(_id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.status === "paid") return res.status(400).json({ message: "Bill already paid" });

    const paymentCode = await getNextCode("utilityPayment", "UPM", 3);
    const pay = await UtilityPayment.create({
      paymentCode,
      billId: bill._id,
      propertyId: bill.propertyId,
      month: bill.month,
      type: bill.type,
      amountPaid: bill.amount,
      paymentMethod,
      paymentDate: new Date(),
    });

    bill.status = "paid";
    await bill.save();

    return res.status(201).json({ payment: pay, bill });
  } catch (e) {
    console.error("payUtilityBill error:", e);
    return res.status(500).json({ message: "Failed to pay utility bill" });
  }
}


// ---------- list payments ----------
async function listUtilityPayments(req, res) {
  try {
    const { propertyId, month, type, billId } = req.query;
    const filter = {};
   if (billId) {
  const trimmed = String(billId).trim();
  const oid = ensureObjectId(trimmed);
  if (oid) {
    filter.billId = oid;
  } else {
    // join with bill to resolve billCode
    const bills = await UtilityBill.find({ billCode: { $regex: `^${trimmed}$`, $options: "i" } }, { _id: 1 }).lean();
    const ids = bills.map(b => b._id);
    if (!ids.length) return res.json([]); // no match
    filter.billId = { $in: ids };
  }
}


    if (propertyId) filter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      filter.month = month;
    }
    if (type) filter.type = type;

    const pays = await UtilityPayment.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "propertyId", select: "name" })
      .lean();

    return res.json(pays);
  } catch (e) {
    console.error("listUtilityPayments error:", e);
    return res.status(500).json({ message: "Failed to fetch utility payments" });
  }
}

module.exports = {
  listUtilityBills,
  createUtilityBill,
  payUtilityBill,
  listUtilityPayments,
};
