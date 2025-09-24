import { useEffect, useState } from "react";
import { getMealInvoices } from "../../../services/mealsApi";

export default function InvoicesTab() {
  const [filters, setFilters] = useState({ month: "", status: "" });
  const [rows, setRows] = useState([]); const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try { setRows(await getMealInvoices(filters)); }
    catch (e) { setErr(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-4">
      <div className="card grid md:grid-cols-4 gap-3">
        <input type="month" className="inp" value={filters.month||""} onChange={e=>setFilters(f=>({...f, month:e.target.value}))}/>
        <select className="select" value={filters.status||""} onChange={e=>setFilters(f=>({...f, status:e.target.value}))}>
          <option value="">All status</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
        <button className="btn-amber" onClick={load}>Search</button>
      </div>

      {err && <div className="card-tight text-red-400">{err}</div>}

      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr>
              <th className="th">Code</th><th className="th">Month</th>
              <th className="th">Orders</th><th className="th">Amount</th>
              <th className="th">Status</th><th className="th">Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map(i=>(
              <tr key={i._id}>
                <td className="td">{i.invoiceCode}</td>
                <td className="td">{i.month}</td>
                <td className="td">{i.orderCount}</td>
                <td className="td">Rs. {(i.amountCents/100).toLocaleString()}</td>
                <td className="td">{i.status}</td>
                <td className="td">{i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "-"}</td>
              </tr>
            )) : (
              <tr><td className="td text-gray-400" colSpan={6}>No invoices</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}