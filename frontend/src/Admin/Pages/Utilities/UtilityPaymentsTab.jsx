// src/Pages/Admin/Utilities/UtilityPaymentsTab.jsx
import { useEffect, useState } from "react";
import { getUtilityBills, payUtilityBill } from "../../../services/utilitiesApi";

export default function PaymentsTab() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [payingId, setPayingId] = useState(null);

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await getUtilityBills({ status: "unpaid" });
      setBills(Array.isArray(res) ? res : []);
    } catch (e) {
      setErr(e?.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onPay(billId) {
    setErr("");
    setMsg("");
    setPayingId(billId);
    try {
      await payUtilityBill({ billId, paymentMethod: "Cash" });
      setMsg("Bill marked as paid");
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to mark bill as paid");
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="table-wrap">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Pending Utility Bills</h3>
        <button className="btn-ghost" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err && <div className="card-tight text-red-400 mb-3">{err}</div>}
      {msg && <div className="card-tight text-green-400 mb-3">{msg}</div>}

      <table className="admin">
        <thead>
          <tr>
            <th className="th">Bill ID</th>
            <th className="th">Property</th>
            <th className="th">Month</th>
            <th className="th">Type</th>
            <th className="th">Amount</th>
            <th className="th">Due</th>
            <th className="th">Action</th>
          </tr>
        </thead>
        <tbody>
          {bills.length ? (
            bills.map((b) => (
              <tr key={b._id}>
                <td className="td">{b.billCode || b._id}</td>
                <td className="td">{b.propertyId?.name || String(b.propertyId || "-")}</td>
                <td className="td">{b.month}</td>
                <td className="td capitalize">{b.type}</td>
                <td className="td">Rs. {Number(b.amount || 0).toLocaleString()}</td>
                <td className="td">
                  {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "-"}
                </td>
                <td className="td">
                  <button
                    className="btn-outline"
                    onClick={() => onPay(b._id)}
                    disabled={payingId === b._id}
                  >
                    {payingId === b._id ? "Paying…" : "Mark as Paid"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="td text-gray-400" colSpan={7}>
                {loading ? "Loading…" : "No unpaid bills"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}