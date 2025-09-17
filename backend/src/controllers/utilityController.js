import UtilityBill from "../models/UtilityBill.js";
import UtilityPayment from "../models/UtilityPayment.js";

// List bills (filter by property, month, status, type)
export async function listBills(req, res) {
  try {
    const { propertyId, month, status, type } = req.query;
    const q = {};
    if (propertyId) q.propertyId = propertyId;
    if (month) q.month = month;
    if (status) q.status = status;
    if (type) q.type = type;
    const items = await UtilityBill.find(q).sort({ dueDate: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// Create a bill
export async function createBill(req, res) {
  try {
    const { propertyId, type, month, amount, billDate, dueDate, photoUrl } = req.body;

    // simple past-date guard
    if (new Date(dueDate) < new Date(new Date().toDateString()))
      return res.status(400).json({ error: "Due date cannot be in the past" });
    if (amount < 0) return res.status(400).json({ error: "Amount cannot be negative" });

    const created = await UtilityBill.create({ propertyId, type, month, amount, billDate, dueDate, photoUrl });
    res.status(201).json(created);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// Mark bill paid + create payment record
export async function payBill(req, res) {
  try {
    const { billId, amountPaid, paymentMethod, paidDate, reference } = req.body;
    const bill = await UtilityBill.findById(billId);
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    if (amountPaid < 0) return res.status(400).json({ error: "Amount cannot be negative" });

    const payment = await UtilityPayment.create({ billId, amountPaid, paymentMethod, paidDate, reference });
    bill.status = "paid";
    await bill.save();

    res.status(201).json({ payment, bill });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// List payment history
export async function listPayments(req, res) {
  try {
    const { propertyId, month, type } = req.query;
    // join via bill
    const q = {};
    if (billFiltersNeeded(propertyId, month, type)) {
      const billQ = {};
      if (propertyId) billQ.propertyId = propertyId;
      if (month) billQ.month = month;
      if (type) billQ.type = type;
      const billIds = await UtilityBill.find(billQ).distinct("_id");
      q.billId = { $in: billIds };
    }
    const items = await UtilityPayment.find(q).sort({ paidDate: -1 }).populate("billId");
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

function billFiltersNeeded(propertyId, month, type) {
  return Boolean(propertyId || month || type);
}
