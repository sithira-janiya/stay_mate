const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

export async function getMealInvoices({ month, status, supplierId } = {}) {
  const url = buildUrl("/meal/invoices", { month, status, supplierId });
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

export async function payMealInvoice({ invoiceId, paymentMethod, notes }) {
  const res = await fetch(`${API_BASE}/meal/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ invoiceId, paymentMethod, notes })
  });
  if (!res.ok) throw new Error(`POST /meal/payments -> ${res.status}`);
  return res.json();
}

export async function getMealPayments({ month, supplierId } = {}) {
  const url = buildUrl("/meal/payments", { month, supplierId });
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}
