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

// --- Properties dropdown ---
export async function getProperties() {
  const raw = await fetchJson(buildUrl("/properties"));
  // Normalize to an array (handles teammate controller shapes)
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data?.properties)) return raw.data.properties;
  if (Array.isArray(raw?.properties)) return raw.properties;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

// --- Utility bills & payments ---
export async function getUtilityBills({ propertyId, month, type, status, billId } = {}) {
  return fetchJson(buildUrl("/utilities/bills", { propertyId, month, type, status, billId }));
}

export async function createUtilityBill(payload) {
  return fetchJson(`${API_BASE}/utilities/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// NOTE: Path matches your current backend (/api/utilities/pay) that expects billId in the body
export async function payUtilityBill({ billId, paymentMethod }) {
  return fetchJson(`${API_BASE}/utilities/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ billId, paymentMethod }),
  });
}

export async function getUtilityPayments({ propertyId, month, type, billId } = {}) {
  return fetchJson(buildUrl("/utilities/payments", { propertyId, month, type, billId }));
}
