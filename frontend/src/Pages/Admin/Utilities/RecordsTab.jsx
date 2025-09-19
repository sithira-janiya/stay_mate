// src/Pages/Admin/Utilities/RecordsTab.jsx
import { useEffect, useState } from "react";
import { getUtilityBills } from "../../../services/utilitiesApi";

export default function RecordsTab() {
  const [filters, setFilters] = useState({
    propertyId: "",
    month: "",
    status: "",
    billId: "",
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await getUtilityBills({
        propertyId: filters.propertyId?.trim() || undefined,
        month: filters.month || undefined,
        status: filters.status || undefined,
        billId: filters.billId?.trim() || undefined,
      });
      setRecords(Array.isArray(res) ? res : []);
    } catch (e) {
      setErr(e?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card grid md:grid-cols-5 gap-3">
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Property ID</label>
          <input
            className="inp"
            placeholder="ObjectId or code"
            value={filters.propertyId}
            onChange={(e) => setFilters((f) => ({ ...f, propertyId: e.target.value }))}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Month</label>
          <input
            type="month"
            className="inp"
            value={filters.month}
            onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Status</label>
          <select
            className="select"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Bill ID</label>
          <input
            className="inp"
            placeholder="Exact _id"
            value={filters.billId}
            onChange={(e) => setFilters((f) => ({ ...f, billId: e.target.value }))}
          />
        </div>

        <div className="flex items-end">
          <button className="btn-amber w-full md:w-auto" onClick={load} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {err && <div className="card-tight text-red-400">{err}</div>}

      {/* Results */}
      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr>
              <th className="th">Bill ID</th>
              <th className="th">Property</th>
              <th className="th">Month</th>
              <th className="th">Type</th>
              <th className="th">Amount</th>
              <th className="th">Due</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length ? (
              records.map((r) => (
                <tr key={r._id}>
                  <td className="td">{r._id}</td>
                  <td className="td">{r.propertyName || r.propertyId}</td>
                  <td className="td">{r.month}</td>
                  <td className="td capitalize">{r.type}</td>
                  <td className="td">Rs. {Number(r.amount || 0).toLocaleString()}</td>
                  <td className="td">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "-"}</td>
                  <td className="td">{r.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="td text-gray-400" colSpan={7}>
                  {loading ? "Loading…" : "No records"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
