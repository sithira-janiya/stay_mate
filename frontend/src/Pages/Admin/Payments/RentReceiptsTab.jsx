// src/Pages/Admin/Payments/ReceiptsTab.jsx
import { useEffect, useState } from "react";
import { getPayments, createReceipt } from "../../../services/rentApi";

export default function ReceiptsTab() {
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    propertyId: "",
    tenantId: "",
  });
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getPayments(filters);
      setRows(data);
    } catch (e) {
      setErr(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setCreating(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await createReceipt({
        invoiceId: form.get("invoiceId")?.trim(),
        amountPaid: Number(form.get("amountPaid")),
        paymentMethod: form.get("paymentMethod"),
      });
      setMsg(`Receipt ${res.payment?.paymentCode || ""} created`);
      e.currentTarget.reset();
      load();
    } catch (e) {
      setErr(e.message || "Failed to create receipt");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card grid gap-3 md:grid-cols-4">
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
            placeholder="e.g. PROP-1001"
            value={filters.propertyId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, propertyId: e.target.value.trim() }))
            }
          />
        </div>
        <div>
          <div className="text-sm text-gray-300 mb-1">Tenant ID (optional)</div>
          <input
            className="inp"
            placeholder="e.g. TEN-001"
            value={filters.tenantId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, tenantId: e.target.value.trim() }))
            }
          />
        </div>
        <div className="flex items-end">
          <button onClick={load} className="btn-amber w-full md:w-auto" disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {err && <div className="card-tight text-red-400">{err}</div>}
      {msg && <div className="card-tight text-green-400">{msg}</div>}

      {/* Create receipt */}
      <form onSubmit={handleCreate} className="card grid gap-3 sm:grid-cols-4">
        <input
          name="invoiceId"
          placeholder="Invoice _id"
          required
          className="inp"
        />
        <input
          name="amountPaid"
          type="number"
          min="0"
          step="1"
          placeholder="Amount (Rs.)"
          required
          className="inp"
        />
        <select
          name="paymentMethod"
          defaultValue="Cash"
          className="select"
        >
          <option>Cash</option>
          <option>Bank Transfer</option>
          <option>Card</option>
          <option>Online</option>
        </select>
        <button className="btn-amber" disabled={creating}>
          {creating ? "Creating…" : "Create Receipt"}
        </button>
      </form>

      {/* Table */}
      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr>
              <th className="th pr-4">Code</th>
              <th className="th pr-4">Invoice</th>
              <th className="th pr-4">Amount</th>
              <th className="th pr-4">Method</th>
              <th className="th">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="td text-gray-400" colSpan={5}>
                  No receipts
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p._id}>
                  <td className="td pr-4">{p.paymentCode}</td>
                  <td className="td pr-4">{p.invoiceId}</td>
                  <td className="td pr-4">
                    Rs. {Number(p.amountPaid).toLocaleString()}
                  </td>
                  <td className="td pr-4">{p.paymentMethod}</td>
                  <td className="td">
                    {p.paymentDate
                      ? new Date(p.paymentDate).toLocaleString()
                      : "-"}
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
