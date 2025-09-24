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
      const _id = ensureObjectId(billId);
      if (!_id) return res.status(400).json({ message: "Invalid billId" });
      filter._id = _id;
    }
    if (propertyId) filter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      filter.month = month;
    }
    if (type) filter.type = type;
    if (status) filter.status = status;

   // list bills
  const docs = await UtilityBill.find(filter)
  .sort({ createdAt: -1 })
  .populate({ path: 'propertyId', select: 'name' })  // <-- add this
  .lean();

    const today = new Date();
    const out = docs.map((d) => {
      if (d.status === "paid") return d;
      const overdue =
        d.dueDate && new Date(dueDateOnly(d.dueDate)) < new Date(today.toDateString());
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
    const { propertyId, month, type, amount, dueDate, billImageUrl = "", notes = "" } =
      req.body || {};
    if (!propertyId || !month || !type || amount == null || !dueDate) {
      return res
        .status(400)
        .json({ message: "propertyId, month, type, amount, dueDate required" });
    }
    if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
    if (Number(amount) < 0) return res.status(400).json({ message: "amount cannot be negative" });

    const due = new Date(dueDate);
    if (due < new Date(new Date().toDateString())) {
      return res.status(400).json({ message: "dueDate cannot be in the past" });
    }

    const bill = await UtilityBill.create({
      propertyId: ensureObjectId(propertyId) || propertyId,
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
    console.error("createUtilityBill error:", e);
    return res.status(500).json({ message: "Failed to create utility bill" });
  }
}

// ---------- pay bill ----------
async function payUtilityBill(req, res) {
  try {
    const { billId, paymentMethod = "Cash" } = req.body || {};
    if (!billId) return res.status(400).json({ message: "billId required" });
    const _id = ensureObjectId(billId);
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
      const _id = ensureObjectId(billId);
      if (!_id) return res.status(400).json({ message: "Invalid billId" });
      filter.billId = _id;
    }
    if (propertyId) filter.propertyId = ensureObjectId(propertyId) || propertyId;
    if (month) {
      if (!isValidMonth(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
      filter.month = month;
    }
    if (type) filter.type = type;

    // list payments
  const pays = await UtilityPayment.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: 'propertyId', select: 'name' })  
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