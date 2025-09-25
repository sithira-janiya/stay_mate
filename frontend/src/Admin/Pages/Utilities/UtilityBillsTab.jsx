// src/Pages/Admin/Utilities/UtilityBillsTab.jsx
import { useEffect, useMemo, useState } from "react";
import { createUtilityBill, getProperties } from "../../../services/utilitiesApi";

// Helpers
const pad2 = (n) => String(n).padStart(2, "0");
const getThisMonthYYYYMM = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};
const getLastMonthYYYYMM = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};
// first day of the current month (YYYY-MM-DD)
const firstDayThisMonthISO = () => {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return first.toISOString().slice(0, 10);
};

export default function BillsTab() {
  const THIS_MONTH = getThisMonthYYYYMM();
  const LAST_MONTH = getLastMonthYYYYMM();
  const DUE_MIN = firstDayThisMonthISO();

  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true); // <-- fixed

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // local form state (for basic validation & UX)
  const [form, setForm] = useState({
    propertyId: "",
    month: THIS_MONTH, // default to this month
    type: "water",
    amount: "",
    dueDate: "",
    notes: "",
  });

  // simple client-side validation
  const amountInvalid = useMemo(() => {
    if (form.amount === "") return true;
    const n = Number(form.amount);
    return Number.isNaN(n) || n < 0;
  }, [form.amount]);

  // month must be either this month or last month
  const monthInvalid = useMemo(() => {
    return !(form.month === THIS_MONTH || form.month === LAST_MONTH);
  }, [form.month, THIS_MONTH, LAST_MONTH]);

  // due date must be >= first day of current month
  const dueDateInvalid = useMemo(() => {
    if (!form.dueDate) return true;
    return form.dueDate < DUE_MIN;
  }, [form.dueDate, DUE_MIN]);

  const formDisabled = submitting || loadingProps;

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const res = await getProperties();
        setProperties(Array.isArray(res) ? res : []);
      } catch (e) {
        setErr("Failed to load properties");
      } finally {
        setLoadingProps(false);
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    // extra guards
    if (!form.propertyId) return setErr("Please select a property.");
    if (amountInvalid) return setErr("Amount must be a number ≥ 0.");
    if (monthInvalid) return setErr(`Month must be either ${LAST_MONTH} or ${THIS_MONTH}.`);
    if (dueDateInvalid) return setErr(`Due date cannot be before ${DUE_MIN}.`);

    try {
      setSubmitting(true);
      await createUtilityBill({
        propertyId: form.propertyId,
        month: form.month,
        type: form.type,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        notes: form.notes?.trim() || "",
      });
      setMsg("Utility bill created!");
      // reset except property (so you can add multiple quickly)
      setForm((f) => ({
        ...f,
        month: THIS_MONTH,
        type: "water",
        amount: "",
        dueDate: "",
        notes: "",
      }));
    } catch (e) {
      setErr(e?.message || "Failed to create bill");
    } finally {
      setSubmitting(false);
    }
  }

  function onCancel() {
    setErr("");
    setMsg("");
    setForm({
      propertyId: "",
      month: THIS_MONTH,
      type: "water",
      amount: "",
      dueDate: "",
      notes: "",
    });
  }

  return (
    <div className="card space-y-4">
      <div className="page-title !mb-2">
        <span className="text-xl">Add Utility Bill</span>
      </div>
      <p className="page-subtle">
        Month can be <strong>this month</strong> or <strong>last month</strong> only.
        Due date cannot be earlier than the <strong>first day of this month</strong>.
      </p>

      {err && <div className="card-tight text-red-400">{err}</div>}
      {msg && <div className="card-tight text-green-400">{msg}</div>}

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
        {/* Property */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Property</label>
          <select
            className="select"
            value={form.propertyId}
            onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
            required
            disabled={formDisabled}
          >
            <option value="">{loadingProps ? "Loading..." : "Select Property"}</option>
            {!loadingProps &&
              properties.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} {p.propertyId ? `(${p.propertyId})` : ""}
                </option>
              ))}
          </select>
        </div>

        {/* Month (limited to last+this month) */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Month</label>
          <input
            type="month"
            className={`inp ${monthInvalid ? "ring-2 ring-red-500" : ""}`}
            value={form.month}
            min={LAST_MONTH}
            max={THIS_MONTH}
            onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
            required
            disabled={formDisabled}
          />
          <span className="text-xs text-gray-400 mt-1">
            Allowed: {LAST_MONTH} or {THIS_MONTH}
          </span>
        </div>

        {/* Type */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Type</label>
          <select
            className="select"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            required
            disabled={formDisabled}
          >
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
          </select>
        </div>

        {/* Amount */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Amount (LKR)</label>
          <input
            type="number"
            min="0"
            step="1"
            className={`inp ${amountInvalid && form.amount !== "" ? "ring-2 ring-red-500" : ""}`}
            placeholder="e.g. 2500"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
            disabled={formDisabled}
          />
        </div>

        {/* Due Date (>= first day of this month) */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            min={DUE_MIN}
            className={`inp ${dueDateInvalid && form.dueDate ? "ring-2 ring-red-500" : ""}`}
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            required
            disabled={formDisabled}
          />
          <span className="text-xs text-gray-400 mt-1">Must be on/after {DUE_MIN}</span>
        </div>

        {/* Notes */}
        <div className="md:col-span-2 flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Notes (optional)</label>
          <input
            className="inp"
            placeholder="Any remarks for this bill"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            disabled={formDisabled}
          />
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex gap-3">
          {/* Green submit */}
          <button
            type="submit"
            disabled={formDisabled}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium
                       bg-green-600 text-white hover:bg-green-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating…" : "Create Bill"}
          </button>

          {/* Red cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium
                       bg-red-600 text-white hover:bg-red-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
