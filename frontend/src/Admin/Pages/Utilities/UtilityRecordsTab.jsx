// src/Pages/Admin/Utilities/UtilityRecordsTab.jsx
import { useEffect, useState, useMemo } from "react";
import { getUtilityBills } from "../../../services/utilitiesApi";

const fmtDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
};

function StatusBadge({ status }) {
  const raw = (status || "").toLowerCase();
  const label = raw === "unpaid" ? "pending" : raw || "-";
  const cls =
    raw === "paid"
      ? "bg-green-600/20 text-green-300 border-green-600/40"
      : raw === "overdue"
      ? "bg-red-600/20 text-red-300 border-red-600/40"
      : "bg-amber-500/20 text-amber-300 border-amber-500/40"; // pending/other
  return (
    <span className={`px-2 py-1 text-xs border rounded-md capitalize ${cls}`}>
      {label}
    </span>
  );
}

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

  const hasFilters = useMemo(
    () => !!(filters.propertyId || filters.month || filters.status || filters.billId),
    [filters]
  );

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await getUtilityBills({
        propertyId: filters.propertyId?.trim() || undefined,
        month: filters.month || undefined,
        status: filters.status || undefined,
        billId: filters.billId?.trim() || undefined, // accepts ObjectId OR billCode (backend updated)
      });
      setRecords(Array.isArray(res) ? res : []);
    } catch (e) {
      setErr(e?.message || "Failed to load records");
      setRecords([]); // keep UI stable
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
            <option value="unpaid">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Bill ID / Code</label>
          <input
            className="inp"
            placeholder="Mongo _id or UBW0001"
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
                  <td className="td">{r.billCode || r._id}</td>
                  <td className="td">
                    {r.propertyId?.name ??
                      r.propertyId?.title ??
                      (typeof r.propertyId === "string" ? r.propertyId : "-")}
                  </td>
                  <td className="td">{r.month || "-"}</td>
                  <td className="td capitalize">{r.type || "-"}</td>
                  <td className="td">Rs. {Number(r.amount ?? 0).toLocaleString()}</td>
                  <td className="td">{fmtDate(r.dueDate)}</td>
                  <td className="td">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="td text-gray-400" colSpan={7}>
                  {loading ? "Loading…" : hasFilters ? "No records found" : "No records"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
