// frontend/src/services/mealsApi.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

async function fetchJson(input, init = {}, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, {
      ...init,
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      let detail = text;
      try { detail = JSON.parse(text)?.message || text; } catch {}
      throw new Error(`${init.method || "GET"} ${typeof input === "string" ? input : input.url} -> ${res.status} ${res.statusText} ${detail}`.trim());
    }
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(t);
  }
}

// ---------- Meal Payments (Admin) ----------
export async function getMealInvoices({ month, status } = {}) {
  const url = buildUrl("/meal-payments/invoices", { month, status });
  return fetchJson(url);
}

export async function payMealInvoice({ invoiceId, paymentMethod, notes = "" }) {
  const url = `${API_BASE}/meal-payments/payments`;
  return fetchJson(url, {
    method: "POST",
    body: JSON.stringify({ invoiceId, paymentMethod, notes }),
  });
}

export async function getMealPayments({ month } = {}) {
  const url = buildUrl("/meal-payments/payments", { month });
  return fetchJson(url);
}