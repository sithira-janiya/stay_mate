// frontend/src/Admin/Pages/Payments/UnpaidInvoicesTab.jsx
import { useEffect, useMemo, useState } from "react";
import { getInvoices, createReceipt } from "../../../services/rentApi";

// Helpers
const fmtDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
};

const computeStatus = (inv) => {
  if (String(inv?.status || "").toLowerCase() === "paid") return "paid";
  const due = inv?.dueDate ? new Date(inv.dueDate) : null;
  if (due && !Number.isNaN(due.getTime())) {
    // compare at midnight to avoid TZ edge cases
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    if (dueMid < today) return "overdue";
  }
  return "pending";
};

const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const base = "px-2 py-1 rounded text-xs font-medium";
  if (s === "paid") return <span className={`${base} bg-green-600/20 text-green-300`}>Paid</span>;
  if (s === "overdue") return <span className={`${base} bg-red-600/20 text-red-300`}>Overdue</span>;
  // pending
  return <span className={`${base} bg-amber-600/20 text-amber-300`}>Pending</span>;
};

export default function UnpaidInvoicesTab() {
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    propertyId: "",
    tenantId: "",
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // per-row payment method (id -> method)
  const [methods, setMethods] = useState({});
  const [payingId, setPayingId] = useState(null);

  const hasFilters = useMemo(
    () => !!(filters.month || filters.propertyId || filters.tenantId),
    [filters]
  );

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const all = await getInvoices({
        month: filters.month || undefined,
        propertyId: filters.propertyId?.trim() || undefined,
        tenantId: filters.tenantId?.trim() || undefined,
      });

      const withDerived = (Array.isArray(all) ? all : []).map((inv) => ({
        ...inv,
        _derivedStatus: computeStatus(inv),
      }));

      // Keep only pending + overdue
      const unpaid = withDerived.filter((i) => i._derivedStatus !== "paid");
      setRows(unpaid);
    } catch (e) {
      setErr(e?.message || "Failed to load invoices");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onMarkPaid(inv) {
    setErr("");
    setMsg("");
    setPayingId(inv._id);
    try {
      const method = methods[inv._id] || "Cash";
      await createReceipt({
        invoiceId: inv._id,
        amountPaid: inv.total, // full payment required by backend
        paymentMethod: method,
      });
      setMsg(`Invoice ${inv.invoiceCode || inv._id} marked as paid.`);
      setTimeout(() => {
        load();
      }, 500);
    } catch (e) {
      setErr(e?.message || "Failed to mark as paid");
    } finally {
      setPayingId(null);
    }
  }

  function onSearch(e) {
    e.preventDefault();
    load();
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form onSubmit={onSearch} className="card grid gap-3 md:grid-cols-4">
        <div>
          <div className="text-sm text-gray-300 mb-1">Month</div>
          <input
            type="month"
            className="date"
            value={filters.month}
            onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
          />
        </div>
        <div>
          <div className="text-sm text-gray-300 mb-1">Property ID (optional)</div>
          <input
            className="inp"
            placeholder="ObjectId"
            value={filters.propertyId}
            onChange={(e) => setFilters((f) => ({ ...f, propertyId: e.target.value }))}
          />
        </div>
        <div>
          <div className="text-sm text-gray-300 mb-1">Tenant ID (optional)</div>
          <input
            className="inp"
            placeholder="Tenant string id"
            value={filters.tenantId}
            onChange={(e) => setFilters((f) => ({ ...f, tenantId: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <button className="btn-amber w-full md:w-auto" disabled={loading}>
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
              <th className="th">Due</th>
              <th className="th">Status</th>
              <th className="th">Method</th>
              <th className="th">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="td text-gray-400" colSpan={13}>
                  {loading
                    ? "Loading…"
                    : hasFilters
                    ? "No unpaid invoices found"
                    : "No unpaid invoices"}
                </td>
              </tr>
            ) : (
              rows.map((inv) => {
                const status = inv._derivedStatus || inv.status || "pending";
                const payingThis = payingId === inv._id;
                const btnClass = payingThis ? "btn-green" : "btn-amber";
                const btnLabel = payingThis ? "Paid!" : "Mark as Paid";

                return (
                  <tr key={inv._id}>
                    <td className="td">{inv.invoiceCode || inv._id}</td>
                    <td className="td">{inv.month}</td>
                    <td className="td">{inv.tenantName || inv.tenantId}</td>

                    {/* IMPORTANT: coerce to string when not populated */}
                    <td className="td">
                      {inv.propertyId?.name || inv.propertyName || String(inv.propertyId || "")}
                    </td>
                    <td className="td">
                      {inv.roomId?.roomNo || inv.roomNumber || String(inv.roomId || "")}
                    </td>

                    <td className="td">Rs. {Number(inv.baseRent || 0).toLocaleString()}</td>
                    <td className="td">Rs. {Number(inv.utilityShare || 0).toLocaleString()}</td>
                    <td className="td">Rs. {Number(inv.mealCost || 0).toLocaleString()}</td>
                    <td className="td font-medium">Rs. {Number(inv.total || 0).toLocaleString()}</td>

                    <td className="td">{fmtDate(inv.dueDate)}</td>
                    <td className="td">
                      <StatusBadge status={status} />
                    </td>

                    <td className="td">
                      <select
                        className="select"
                        value={methods[inv._id] || "Cash"}
                        onChange={(e) => setMethods((m) => ({ ...m, [inv._id]: e.target.value }))}
                        disabled={payingThis}
                      >
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                        <option>Card</option>
                        <option>Online</option>
                      </select>
                    </td>

                    <td className="td">
                      <button className={btnClass} onClick={() => onMarkPaid(inv)} disabled={payingThis}>
                        {btnLabel}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
