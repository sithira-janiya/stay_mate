// frontend/src/Admin/Pages/Payments/RentInvoicesTab.jsx
import { useEffect, useMemo, useState } from "react";
import { getInvoices, deleteInvoice } from "../../../services/rentApi";

const fmtDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
};

/** Faded status pill (Paid = green, Overdue = amber, Unpaid = red) */
const StatusPill = ({ status }) => {
  const s = String(status || "").toLowerCase(); // "paid" | "overdue" | "unpaid"
  const base = "px-2 py-1 rounded text-xs font-semibold";
  if (s === "paid")     return <span className={`${base} bg-green-600/20 text-green-300`}>Paid</span>;
  if (s === "overdue")  return <span className={`${base} bg-amber-600/20 text-amber-300`}>Overdue</span>;
  return <span className={`${base} bg-red-600/20 text-red-300`}>Unpaid</span>;
};

export default function InvoicesTab() {
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    propertyId: "",
    tenantId: "",
  });
  const [statusFilter, setStatusFilter] = useState(""); // "", "paid", "unpaid", "overdue"
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const data = await getInvoices({
        month: filters.month || undefined,
        propertyId: filters.propertyId?.trim() || undefined,
        tenantId: filters.tenantId?.trim() || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to fetch invoices");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load();
  }

  const withDerived = useMemo(() => {
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    return rows.map((inv) => {
      const paid = String(inv.status).toLowerCase() === "paid";
      const due = inv.dueDate ? new Date(inv.dueDate) : null;
      const overdue = !paid && due && due < todayMid;
      const derivedStatus = paid ? "paid" : overdue ? "overdue" : "unpaid";
      return { ...inv, derivedStatus };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    if (!statusFilter) return withDerived;
    return withDerived.filter((r) => r.derivedStatus === statusFilter);
  }, [withDerived, statusFilter]);

  async function onDelete(id) {
    if (!id) return;
    if (!window.confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      setErr("");
      setMsg("");
      await deleteInvoice(id);
      setMsg("Invoice deleted.");
      setRows((rs) => rs.filter((r) => r._id !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form onSubmit={handleSearch} className="card grid gap-3 md:grid-cols-5">
        <div>
          <div className="text-sm text-gray-300 mb-1">Month</div>
          <input
            type="month"
            className="date"
            value={filters.month}
            onChange={(e) =>
              setFilters((f) => ({ ...f, month: e.target.value }))
            }
          />
        </div>

        <div>
          <div className="text-sm text-gray-300 mb-1">Property ID (optional)</div>
          <input
            className="inp"
            placeholder="Mongo _id or code"
            value={filters.propertyId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, propertyId: e.target.value }))
            }
          />
        </div>

        <div>
          <div className="text-sm text-gray-300 mb-1">Tenant ID</div>
          <input
            className="inp"
            placeholder="tenant string id"
            value={filters.tenantId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, tenantId: e.target.value }))
            }
          />
        </div>

        <div>
          <div className="text-sm text-gray-300 mb-1">Status</div>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="btn-amber w-full md:w-auto"
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {err && <div className="card-tight text-red-400">{err}</div>}
      {msg && <div className="card-tight text-green-400">{msg}</div>}

      {/* Table */}
      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr>
              <th className="th">Code</th>
              <th className="th">Month</th>
              <th className="th">Tenant</th>
              <th className="th">Property</th>
              <th className="th">Room</th>
              <th className="th">Base</th>
              <th className="th">Utilities</th>
              <th className="th">Meals</th>
              <th className="th">Total</th>
              <th className="th">Status</th>
              <th className="th">Due</th>
              <th className="th">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="td text-gray-400" colSpan={12}>
                  {loading ? "Loading…" : "No invoices found"}
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv._id}>
                  <td className="td">{inv.invoiceCode}</td>
                  <td className="td">{inv.month}</td>
                  <td className="td">{inv.tenantName || inv.tenantId}</td>
                  <td className="td">
                    {inv.propertyId?.name || inv.propertyName || String(inv.propertyId)}
                  </td>
                  <td className="td">
                    {inv.roomId?.roomNo || inv.roomNumber || String(inv.roomId)}
                  </td>
                  <td className="td">Rs. {Number(inv.baseRent || 0).toLocaleString()}</td>
                  <td className="td">Rs. {Number(inv.utilityShare || 0).toLocaleString()}</td>
                  <td className="td">Rs. {Number(inv.mealCost || 0).toLocaleString()}</td>
                  <td className="td font-medium">Rs. {Number(inv.total || 0).toLocaleString()}</td>
                  <td className="td">
                    <StatusPill status={inv.derivedStatus} />
                  </td>
                  <td className="td">{fmtDate(inv.dueDate)}</td>
                  <td className="td">
                    <button
                      onClick={() => onDelete(inv._id)}
                      disabled={deletingId === inv._id}
                      title="Delete invoice"
                      className={`px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white
                                  focus:outline-none focus:ring-2 focus:ring-red-400/60
                                  disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {deletingId === inv._id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
