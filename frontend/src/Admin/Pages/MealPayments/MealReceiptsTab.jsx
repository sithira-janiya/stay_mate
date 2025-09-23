import { useEffect, useState } from "react";
import { getMealPayments } from "../../../services/mealsApi";

export default function ReceiptsTab() {
  const [filters, setFilters] = useState({ month: "" });
  const [rows, setRows] = useState([]); const [err, setErr] = useState("");

  async function load(){ setErr("");
    try { setRows(await getMealPayments(filters)); }
    catch(e){ setErr(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-4">
      <div className="card grid md:grid-cols-3 gap-3">
        <input type="month" className="inp" value={filters.month||""} onChange={e=>setFilters(f=>({...f, month:e.target.value}))}/>
        <button className="btn-amber" onClick={load}>Search</button>
      </div>

      {err && <div className="card-tight text-red-400">{err}</div>}

      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr><th className="th">Payment</th><th className="th">Invoice</th><th className="th">Month</th><th className="th">Amount</th><th className="th">Method</th><th className="th">Date</th></tr>
          </thead>
          <tbody>
            {rows.length ? rows.map(p=>(
              <tr key={p._id}>
                <td className="td">{p.paymentCode}</td>
                <td className="td">{p.invoiceId}</td>
                <td className="td">{p.inv?.month || p.month || "-"}</td>
                <td className="td">Rs. {(p.amountCents/100).toLocaleString()}</td>
                <td className="td">{p.paymentMethod}</td>
                <td className="td">{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : "-"}</td>
              </tr>
            )) : (
              <tr><td className="td text-gray-400" colSpan={6}>No payments</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
