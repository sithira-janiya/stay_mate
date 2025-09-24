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

// ---------- Meal Payments (Admin) ----------
export async function getMealInvoices({ month, status } = {}) {
  return fetchJson(buildUrl("/meal-payments/invoices", { month, status }));
}

export async function payMealInvoice({ invoiceId, paymentMethod, notes = "" }) {
  return fetchJson(`${API_BASE}/meal-payments/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId, paymentMethod, notes }),
  });
}

export async function getMealPayments({ month } = {}) {
  return fetchJson(buildUrl("/meal-payments/payments", { month }));
}
