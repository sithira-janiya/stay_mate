const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

// Dropdown needs properties list
export async function getProperties() {
  const url = buildUrl("/properties"); // 🔶 if your team’s endpoint differs, adjust here
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

export async function getUtilityBills({ propertyId, month, type, status, billId } = {}) {
  const url = buildUrl("/utilities/bills", { propertyId, month, type, status, billId });
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

export async function createUtilityBill(payload) {
  const url = `${API_BASE}/utilities/bills`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} -> ${res.status} ${text}`);
  }
  return res.json();
}

export async function payUtilityBill({ billId, paymentMethod }) {
  const url = `${API_BASE}/utilities/pay`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ billId, paymentMethod }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} -> ${res.status} ${text}`);
  }
  return res.json();
}

export async function getUtilityPayments({ propertyId, month, type, billId } = {}) {
  const url = buildUrl("/utilities/payments", { propertyId, month, type, billId });
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}
