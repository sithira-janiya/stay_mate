// frontend/src/Pages/Admin/Payments/RentGenerateTab.jsx
import { useEffect, useMemo, useState } from "react";
import { generateInvoices } from "../../../services/rentApi";
import { getProperties } from "../../../services/utilitiesApi";

// ----- date helpers (LOCAL time) -----
function ym(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function getMonthOffset(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return ym(d);
}
function firstDayOfCurrentMonthISO() {
  const d = new Date();
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  return x.toISOString().slice(0, 10);
}
function lastDayOfNextMonthISO() {
  const d = new Date();
  const lastNext = new Date(d.getFullYear(), d.getMonth() + 2, 0); // day 0 of the month+2 = last day of next month
  return lastNext.toISOString().slice(0, 10);
}

export default function GenerateTab() {
  // allowed months: current & previous
  const allowedMonths = useMemo(() => [getMonthOffset(0), getMonthOffset(-1)], []);
  const [month, setMonth] = useState(allowedMonths[0]);

  // due date bounds: from 1st of this month to end of next month
  const dueMin = useMemo(firstDayOfCurrentMonthISO, []);
  const dueMax = useMemo(lastDayOfNextMonthISO, []);
  const [dueDate, setDueDate] = useState("");

  // property dropdown
  const [properties, setProperties] = useState([]);
  const [propLoading, setPropLoading] = useState(true);
  const [propertyId, setPropertyId] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const list = await getProperties();
        setProperties(Array.isArray(list) ? list : []);
      } catch (e) {
        setErr("Failed to load properties");
      } finally {
        setPropLoading(false);
      }
    })();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    // basic client validation
    if (!allowedMonths.includes(month)) {
      return setErr(`Month must be one of: ${allowedMonths.join(", ")}`);
    }
    if (!dueDate) return setErr("Please choose a due date.");
    if (dueDate < dueMin || dueDate > dueMax) {
      return setErr(`Due date must be between ${dueMin} and ${dueMax}.`);
    }

    try {
      setLoading(true);

      // NOTE: make sure your backend & rentApi support propertyId.
      // If your current rentApi.generateInvoices doesn't include it,
      // update it to forward { propertyId } in the JSON body.
      const res = await generateInvoices({ month, dueDate, propertyId: propertyId || undefined });

      const created =
        res?.createdCount ??
        res?.count ??
        (Array.isArray(res?.invoices) ? res.invoices.length : 0);

      if (created === 0) {
        setMsg(`No new invoices created for ${month}${propertyId ? " (selected property)" : ""}.`);
      } else {
        setMsg(`Created ${created} invoice(s) for ${month}${propertyId ? " (selected property)" : ""}.`);
      }
    } catch (e) {
      setErr(e.message || "Failed to generate invoices");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {err && <div className="card-tight text-red-400">{err}</div>}
      {msg && <div className="card-tight text-green-400">{msg}</div>}

      <form onSubmit={submit} className="card grid gap-3 sm:grid-cols-4">
        {/* Property (optional filter) */}
        <div className="sm:col-span-2">
          <div className="text-sm text-gray-300 mb-1">Property (optional)</div>
          <select
            className="select w-full"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            disabled={propLoading}
          >
            <option value="">{propLoading ? "Loading..." : "All properties"}</option>
            {!propLoading &&
              properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.propertyId ? `(${p.propertyId})` : ""}
                </option>
              ))}
          </select>
        </div>

        {/* Month (locked to current & previous) */}
        <div>
          <div className="text-sm text-gray-300 mb-1">Month</div>
          <select
            className="select w-full"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {allowedMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <div className="text-sm text-gray-300 mb-1">Due Date</div>
          <input
            type="date"
            className="date w-full"
            min={dueMin}
            max={dueMax}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        {/* Generate */}
        <div className="sm:col-span-4 flex justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50"
            disabled={loading || propLoading}
          >
            {loading ? "Generating…" : "Generate Invoices"}
          </button>
        </div>
      </form>

      <div className="card-tight text-gray-300 text-sm">
        • Generates rent invoices per tenant for the selected month (and property if chosen).<br />
        • Allowed months: current or previous. Due date must be this month or next month.<br />
        • Duplicates are skipped by the backend (existing invoice for same tenant+month won’t be recreated).
      </div>
    </div>
  );
}
