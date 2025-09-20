// src/Pages/Admin/Utilities/BillsTab.jsx
import { useEffect, useMemo, useState } from "react";
import { createUtilityBill, getProperties } from "../../../services/utilitiesApi";

// YYYY-MM for default month
const currentMonth = () => new Date().toISOString().slice(0, 7);
// YYYY-MM-DD for min(dueDate)
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function BillsTab() {
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // local form state (for basic validation & UX)
  const [form, setForm] = useState({
    propertyId: "",
    month: currentMonth(),
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

  const dueDateMin = useMemo(() => todayISO(), []);
  const dueDateInvalid = useMemo(() => {
    if (!form.dueDate) return true;
    return form.dueDate < dueDateMin; // no past due date
  }, [form.dueDate, dueDateMin]);

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
    if (dueDateInvalid) return setErr("Due date cannot be in the past.");

    try {
      setSubmitting(true);
      await createUtilityBill({
        propertyId: form.propertyId,                 // NOTE: expects ObjectId
        month: form.month,                           // YYYY-MM
        type: form.type,                             // "water"|"electricity"
        amount: Number(form.amount),                 // LKR
        dueDate: form.dueDate,                       // YYYY-MM-DD
        notes: form.notes?.trim() || "",
      });
      setMsg("Utility bill created!");
      // reset except property (so you can add multiple quickly)
      setForm((f) => ({
        ...f,
        month: currentMonth(),
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

  return (
    <div className="card space-y-4">
      <div className="page-title !mb-2">
        <span className="text-xl">Add Utility Bill</span>
      </div>
      <p className="page-subtle">
        Create a monthly utility bill (water or electricity) for a property. Due date cannot be in the past.
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
                <option key={p._id} value={p._id}>
                  {p.name} ({p.propertyId})
                </option>
              ))}
          </select>
        </div>

        {/* Month */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Month</label>
          <input
            type="month"
            className="inp"
            value={form.month}
            onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
            required
            disabled={formDisabled}
          />
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

        {/* Due Date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            min={dueDateMin}
            className={`inp ${dueDateInvalid && form.dueDate ? "ring-2 ring-red-500" : ""}`}
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            required
            disabled={formDisabled}
          />
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

        <div className="md:col-span-2">
          <button className="btn-amber" disabled={formDisabled}>
            {submitting ? "Creating…" : "Create Bill"}
          </button>
        </div>
      </form>
    </div>
  );
}
