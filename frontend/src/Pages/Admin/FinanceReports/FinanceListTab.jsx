//FinanceListTab.jsx
import { useEffect, useState } from "react";
import { getFinanceReports } from "/src/services/financeApi";


export default function FinanceListTab() {
  const [reports, setReports] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getFinanceReports();
        setReports(res);
      } catch (e) {
        setErr(e.message);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      {err && <div className="text-red-400">{err}</div>}
      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr>
              <th className="th">Type</th>
              <th className="th">Month</th>
              <th className="th">Generated At</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length ? reports.map(r => (
              <tr key={r._id}>
                <td className="td">{r.reportType}</td>
                <td className="td">{r.month}</td>
                <td className="td">{new Date(r.generatedAt).toLocaleString()}</td>
                <td className="td">
                  <a className="btn-outline" href={`/admin/finance-reports/${r._id}`}>
                    View
                  </a>
                </td>
              </tr>
            )) : (
              <tr><td className="td text-gray-400" colSpan={4}>No reports</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
