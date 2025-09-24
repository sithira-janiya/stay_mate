// frontend/src/services/rentApi.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") url.searchParams.set(k, v);
  }
  return url.toString();
}

async function fetchJson(input, init = {}, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, {
      ...init,
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        ...(init.headers || {}),
      },
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      let msg = text || `HTTP ${res.status}`;
      try {
        const json = JSON.parse(text);
        if (json?.message) msg = json.message;
      } catch {}
      throw new Error(msg);
    }
    return text ? JSON.parse(text) : null;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Request timed out");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function getInvoices({ month, propertyId, tenantId } = {}) {
  return fetchJson(buildUrl("/owner/rent/invoices", { month, propertyId, tenantId }));
}

export async function getPayments({ month, propertyId, tenantId } = {}) {
  return fetchJson(buildUrl("/owner/rent/payments", { month, propertyId, tenantId }));
}

export async function generateInvoices({ month, dueDate, propertyId }) {
  return fetchJson(`${API_BASE}/owner/rent/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month, dueDate, propertyId }), // <-- include propertyId
  });
}

export async function createReceipt({ invoiceId, amountPaid, paymentMethod }) {
  return fetchJson(`${API_BASE}/owner/rent/receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId, amountPaid, paymentMethod }),
  });
}

// delete invoice by id
export async function deleteInvoice(invoiceId) {
  return fetchJson(`${API_BASE}/owner/rent/invoices/${invoiceId}`, {
    method: "DELETE",
  });
}
