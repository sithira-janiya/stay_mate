//FinanceDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFinanceReport } from "../../../services/financeApi";

export default function FinanceDetailTab() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getFinanceReport(id);
        setReport(res);
      } catch (e) {
        setErr(e.message);
      }
    }
    load();
  }, [id]);

  if (err) return <div className="text-red-400">{err}</div>;
  if (!report) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="card space-y-3">
      <h3 className="text-white font-semibold">Report Details</h3>
      <p><strong>Type:</strong> {report.reportType}</p>
      <p><strong>Month:</strong> {report.month}</p>
      <p><strong>Generated At:</strong> {new Date(report.generatedAt).toLocaleString()}</p>
      <pre className="bg-gray-800 p-3 rounded text-sm text-green-400">
        {JSON.stringify(report.data, null, 2)}
      </pre>
    </div>
  );
}