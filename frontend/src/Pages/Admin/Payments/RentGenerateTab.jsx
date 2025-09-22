import { useState } from "react";
import { generateInvoices } from "../../../services/rentApi";

export default function GenerateTab() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dueDate, setDueDate] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);
    try {
      const res = await generateInvoices({ month, dueDate });
      const count =
        res?.createdCount ??
        res?.count ??
        (Array.isArray(res?.invoices) ? res.invoices.length : 0);
      setMsg(`Created ${count} invoice(s) for ${month}`);
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

      <form onSubmit={submit} className="card grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-sm text-gray-300 mb-1">Month</div>
          <input
            type="month"
            className="date"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="text-sm text-gray-300 mb-1">Due Date</div>
          <input
            type="date"
            className="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="flex items-end">
          <button className="btn-amber w-full sm:w-auto" disabled={loading}>
            {loading ? "Generating…" : "Generate Invoices"}
          </button>
        </div>
      </form>

      <div className="card-tight text-gray-300 text-sm">
        • Generates rent invoices for all active tenants for the selected month.<br />
        • Utility and meal charges are auto-calculated from your data.
      </div>
    </div>
  );
}
