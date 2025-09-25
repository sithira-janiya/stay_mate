// frontend/src/Pages/Admin/Finance/FinanceListTab.jsx
import { useEffect, useState } from "react";
import { getFinanceReports } from "/src/services/financeApi";

export default function FinanceListTab() {
  const [month, setMonth] = useState("");
  const [reports, setReports] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr(""); setLoading(true);
    try {
      const res = await getFinanceReports({ month: month || undefined, reportType: "summary" });
      setReports(Array.isArray(res) ? res : []);
    } catch (e) {
      setErr(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-4">
      <div className="card grid md:grid-cols-4 gap-3">
        <div>
          <div className="text-sm text-gray-300 mb-1">Month (optional)</div>
          <input
            type="month"
            className="date"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button className="btn-amber" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {err && <div className="text-red-400">{err}</div>}

      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr>
              <th className="th">Code</th>
              <th className="th">Type</th>
              <th className="th">Month</th>
              <th className="th">Generated At</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length ? reports.map(r => (
              <tr key={r._id}>
                <td className="td font-mono">{r.reportCode}</td>
                <td className="td capitalize">{r.reportType}</td>
                <td className="td">{r.month}</td>
                <td className="td">{r.generatedAt ? new Date(r.generatedAt).toLocaleString() : "-"}</td>
                <td className="td">
                  {/* GREEN VIEW BUTTON */}
                  <a
                    href={`/admin/finance-reports/${r.reportCode}`}
                    className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white inline-block"
                  >
                    View
                  </a>
                </td>
              </tr>
            )) : (
              <tr><td className="td text-gray-400" colSpan={5}>
                {loading ? "Loading…" : "No reports"}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
