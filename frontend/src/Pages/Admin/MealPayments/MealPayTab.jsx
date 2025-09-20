import { useEffect, useState } from "react";
import { getMealInvoices, payMealInvoice } from "../../../services/mealsApi";

export default function PayTab() {
  const [rows, setRows] = useState([]); const [err, setErr] = useState(""); const [msg, setMsg] = useState("");

  async function load(){ setErr(""); setMsg("");
    try { setRows(await getMealInvoices({ status: "unpaid" })); }
    catch(e){ setErr(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  async function onPay(id, method){
    setErr(""); setMsg("");
    try{
      const r = await payMealInvoice({ invoiceId: id, paymentMethod: method });
      setMsg(`Paid ${r?.payment?.paymentCode || ""}`);
      load();
    }catch(e){ setErr(e.message); }
  }

  return (
    <div className="table-wrap">
      <h3 className="text-white font-semibold mb-3">Unpaid Meal Invoices</h3>
      {err && <div className="text-red-400">{err}</div>}
      {msg && <div className="text-green-400">{msg}</div>}
      <table className="admin">
        <thead>
          <tr><th className="th">Code</th><th className="th">Month</th><th className="th">Amount</th><th className="th">Method</th><th className="th">Action</th></tr>
        </thead>
        <tbody>
          {rows.length ? rows.map(i=>(
            <tr key={i._id}>
              <td className="td">{i.invoiceCode}</td>
              <td className="td">{i.month}</td>
              <td className="td">Rs. {(i.amountCents/100).toLocaleString()}</td>
              <td className="td">
                <select className="select" onChange={e=>i._m=e.target.value} defaultValue="Cash">
                  <option>Cash</option><option>Bank Transfer</option><option>Card</option><option>Online</option>
                </select>
              </td>
              <td className="td">
                <button className="btn-outline" onClick={()=>onPay(i._id, i._m || "Cash")}>Pay</button>
              </td>
            </tr>
          )) : (
            <tr><td className="td text-gray-400" colSpan={5}>No unpaid invoices</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
