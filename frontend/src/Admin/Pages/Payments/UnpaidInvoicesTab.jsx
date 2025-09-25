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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    if (dueMid < today) return "overdue";
  }
  return "pending";
};

const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const base =
    "inline-block min-w-[76px] text-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap";
  if (s === "paid") return <span className={`${base} bg-green-600/20 text-green-300`}>Paid</span>;
  if (s === "overdue") return <span className={`${base} bg-red-600/20 text-red-300`}>Overdue</span>;
  return <span className={`${base} bg-amber-600/20 text-amber-300`}>Pending</span>;
};

// Keep one definition so header & rows always match.
// Tweak widths if you want more/less space per column.
const COLS =
  "grid grid-cols-[140px_110px_160px_260px_140px_110px_100px_100px_120px_130px_115px_140px_120px] gap-x-4 items-center";

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
        amountPaid: inv.total,
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

      {/* Grid "table" wrapped in a single card so edges/padding align */}
      <div className="card p-0 overflow-x-auto">
        {/* This inner wrapper sets consistent horizontal padding for header+rows
            and establishes a minimum width so columns don't collapse. */}
        <div className="min-w-[1200px] px-4 sm:px-6">
          {/* Header */}
          <div className={`${COLS} text-sm text-gray-300 py-3 border-b border-gray-700/60`}>
            <div>Code</div>
            <div>Month</div>
            <div>Tenant</div>
            <div>Property</div>
            <div>Room</div>
            <div className="text-right">Base</div>
            <div className="text-right">Utilities</div>
            <div className="text-right">Meals</div>
            <div className="text-right">Total</div>
            <div>Due</div>
            <div>Status</div>
            <div>Method</div>
            <div>Action</div>
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <div className="text-gray-400 py-6 text-center">
              {loading
                ? "Loading…"
                : hasFilters
                ? "No unpaid invoices found"
                : "No unpaid invoices"}
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {rows.map((inv) => {
                const status = inv._derivedStatus || inv.status || "pending";
                const payingThis = payingId === inv._id;
                const btnClass = payingThis ? "btn-green" : "btn-amber";
                const btnLabel = payingThis ? "Paid!" : "Mark as Paid";

                const propertyText =
                  inv?.propertyId?.name || inv?.propertyName || String(inv?.propertyId || "");
                const roomText =
                  inv?.roomId?.roomNo || inv?.roomNumber || String(inv?.roomId || "");

                return (
                  <div key={inv._id} className={`${COLS} py-3`}>
                    <div className="truncate" title={inv.invoiceCode || inv._id}>
                      {inv.invoiceCode || inv._id}
                    </div>
                    <div className="truncate" title={inv.month}>
                      {inv.month}
                    </div>
                    <div className="truncate" title={inv.tenantName || inv.tenantId}>
                      {inv.tenantName || inv.tenantId}
                    </div>
                    <div className="truncate" title={propertyText}>
                      {propertyText}
                    </div>
                    <div className="truncate" title={roomText}>
                      {roomText}
                    </div>

                    <div className="text-right whitespace-nowrap">
                      Rs. {Number(inv.baseRent || 0).toLocaleString()}
                    </div>
                    <div className="text-right whitespace-nowrap">
                      Rs. {Number(inv.utilityShare || 0).toLocaleString()}
                    </div>
                    <div className="text-right whitespace-nowrap">
                      Rs. {Number(inv.mealCost || 0).toLocaleString()}
                    </div>
                    <div className="text-right font-medium whitespace-nowrap pr-2">
                      Rs. {Number(inv.total || 0).toLocaleString()}
                    </div>

                    <div className="whitespace-nowrap">{fmtDate(inv.dueDate)}</div>
                    <div>
                      <StatusBadge status={status} />
                    </div>

                    <div>
                      <select
                        className="select h-8 text-xs w-[130px]"
                        value={methods[inv._id] || "Cash"}
                        onChange={(e) => setMethods((m) => ({ ...m, [inv._id]: e.target.value }))}
                        disabled={payingThis}
                      >
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                        <option>Card</option>
                        <option>Online</option>
                      </select>
                    </div>

                    <div>
                      <button
                        className={`${btnClass} h-8 px-3 text-xs w-[110px]`}
                        onClick={() => onMarkPaid(inv)}
                        disabled={payingThis}
                      >
                        {btnLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
