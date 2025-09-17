import { useEffect, useState } from "react";
import { getInvoices } from "../../../services/rentApi";

export default function InvoicesTab() {
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    propertyId: "",
    tenantId: "",
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getInvoices(filters);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }

  // Load on mount
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit handler so pressing Enter in Tenant ID works
  function handleSearch(e) {
    e.preventDefault();
    load();
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form onSubmit={handleSearch} className="card grid gap-3 md:grid-cols-4">
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
            placeholder="e.g. PROP-1001"
            value={filters.propertyId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, propertyId: e.target.value.trim() }))
            }
          />
        </div>
        <div>
          <div className="text-sm text-gray-300 mb-1">Tenant ID</div>
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
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="td text-gray-400" colSpan={11}>
                  No invoices found
                </td>
              </tr>
            ) : (
              rows.map((inv) => (
                <tr key={inv._id}>
                  <td className="td">{inv.invoiceCode}</td>
                  <td className="td">{inv.month}</td>
                  <td className="td">{inv.tenantName || inv.tenantId}</td>
                  <td className="td">{inv.propertyName || inv.propertyId}</td>
                  <td className="td">{inv.roomNumber || inv.roomId}</td>
                  <td className="td">
                    Rs. {Number(inv.baseRent || 0).toLocaleString()}
                  </td>
                  <td className="td">
                    Rs. {Number(inv.utilities || 0).toLocaleString()}
                  </td>
                  <td className="td">
                    Rs. {Number(inv.meals || 0).toLocaleString()}
                  </td>
                  <td className="td font-medium">
                    Rs. {Number(inv.total || 0).toLocaleString()}
                  </td>
                  <td className="td">{inv.status || "-"}</td>
                  <td className="td">
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString()
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
