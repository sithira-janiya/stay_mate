//FinanceGenerateTab.jsx
import { useState } from "react";
import { generateFinanceReport } from "../../../services/financeApi";

export default function FinanceGenerateTab() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    const f = new FormData(e.currentTarget);
    try {
      await generateFinanceReport({
        reportType: f.get("reportType"),
        month: f.get("month"),
        notes: f.get("notes") || ""
      });
      setMsg("Report generated successfully!");
      e.currentTarget.reset();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="card space-y-3">
      <h3 className="text-white font-semibold">Generate Finance Report</h3>
      {err && <div className="text-red-400">{err}</div>}
      {msg && <div className="text-green-400">{msg}</div>}
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
        <select name="reportType" className="select" required>
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="meals">Meals</option>
          <option value="summary">Summary</option>
        </select>
        <input name="month" type="month" className="inp" required />
        <input name="notes" className="inp md:col-span-2" placeholder="Notes (optional)" />
        <button className="btn-amber md:col-span-2">Generate</button>
      </form>
    </div>
  );
}
