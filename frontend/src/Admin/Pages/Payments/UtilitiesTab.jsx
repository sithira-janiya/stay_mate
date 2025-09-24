//frontend/src/Admin/Pages/Payments/UtilitiesTab.jsx
import { useEffect, useState } from 'react';
import { createUtilityBill, getUtilityBills, payUtilityBill, getUtilityPayments } from '../../../services/utilitiesApi';

export default function UtilitiesTab() {
  const [filters, setFilters] = useState({ month: new Date().toISOString().slice(0,7) });
  const [bills, setBills] = useState([]);
  const [pays, setPays] = useState([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setErr(''); setMsg('');
    try {
      const [b, p] = await Promise.all([
        getUtilityBills(filters),
        getUtilityPayments(filters),
      ]);
      setBills(b); setPays(p);
    } catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function onCreateBill(e) {
    e.preventDefault(); setErr(''); setMsg('');
    const f = new FormData(e.currentTarget);
    try {
      await createUtilityBill({
        propertyId: f.get('propertyId').trim(), // 🔶 ensure you pass ObjectId
        month: f.get('month'),
        type: f.get('type'),
        amount: Number(f.get('amount')),
        dueDate: f.get('dueDate'),
        billImageUrl: f.get('billImageUrl') || '',
        notes: f.get('notes') || ''
      });
      setMsg('Bill created');
      e.currentTarget.reset();
      load();
    } catch (e) { setErr(e.message); }
  }

  async function onPay(billId) {
    setErr(''); setMsg('');
    try {
      await payUtilityBill({ billId, paymentMethod: 'Cash' });
      setMsg('Bill paid');
      load();
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card grid md:grid-cols-4 gap-3">
        <div>
          <div className="text-sm text-gray-300 mb-1">Month</div>
          <input type="month" className="date" value={filters.month || ''}
                 onChange={e=>setFilters(f=>({...f, month:e.target.value}))}/>
        </div>
        <input className="inp" placeholder="Property ObjectId (optional)"
               value={filters.propertyId||''}
               onChange={e=>setFilters(f=>({...f, propertyId:e.target.value.trim()}))}/>
        <select className="select" value={filters.type||''}
                onChange={e=>setFilters(f=>({...f, type:e.target.value}))}>
          <option value="">All types</option>
          <option value="water">Water</option>
          <option value="electricity">Electricity</option>
        </select>
        <button className="btn-amber" onClick={load}>Refresh</button>
      </div>

      {err && <div className="card-tight text-red-400">{err}</div>}
      {msg && <div className="card-tight text-green-400">{msg}</div>}

      {/* Create Bill */}
      <div className="card">
        <h3 className="text-white font-semibold mb-3">Add Utility Bill</h3>
        <form onSubmit={onCreateBill} className="grid md:grid-cols-3 gap-3">
          <input name="propertyId" className="inp" placeholder="Property ObjectId (required)" required/>
          <input name="month" type="month" className="inp" defaultValue={new Date().toISOString().slice(0,7)} required/>
          <select name="type" className="select" defaultValue="water" required>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
          </select>
          <input name="amount" type="number" min="0" step="1" className="inp" placeholder="Amount (LKR)" required/>
          <input name="dueDate" type="date" className="inp" required/>
          <input name="billImageUrl" className="inp" placeholder="Bill image URL (optional)"/>
          <input name="notes" className="inp" placeholder="Notes (optional)"/>
          <div className="md:col-span-3">
            <button className="btn-amber">Create Bill</button>
          </div>
        </form>
      </div>

      {/* Bills table */}
      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr>
              <th className="th">Month</th>
              <th className="th">Type</th>
              <th className="th">Amount</th>
              <th className="th">Due</th>
              <th className="th">Status</th>
              <th className="th">Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.length ? bills.map(b=>(
              <tr key={b._id}>
                <td className="td">{b.month}</td>
                <td className="td capitalize">{b.type}</td>
                <td className="td">Rs. {Number(b.amount).toLocaleString()}</td>
                <td className="td">{b.dueDate ? new Date(b.dueDate).toLocaleDateString() : '-'}</td>
                <td className="td">{b.status}</td>
                <td className="td">
                  {b.status === 'unpaid' ? (
                    <button className="btn-outline" onClick={()=>onPay(b._id)}>Pay</button>
                  ) : '—'}
                </td>
              </tr>
            )) : (
              <tr><td className="td text-gray-400" colSpan={6}>No bills</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payments table */}
      <div className="table-wrap">
        <h3 className="text-white font-semibold mb-3">Utility Payments</h3>
        <table className="admin">
          <thead>
            <tr>
              <th className="th">Code</th>
              <th className="th">Month</th>
              <th className="th">Type</th>
              <th className="th">Amount</th>
              <th className="th">Method</th>
              <th className="th">Date</th>
            </tr>
          </thead>
          <tbody>
            {pays.length ? pays.map(p=>(
              <tr key={p._id}>
                <td className="td">{p.paymentCode}</td>
                <td className="td">{p.month}</td>
                <td className="td capitalize">{p.type}</td>
                <td className="td">Rs. {Number(p.amountPaid).toLocaleString()}</td>
                <td className="td">{p.paymentMethod}</td>
                <td className="td">{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '-'}</td>
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