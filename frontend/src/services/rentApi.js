// frontend/src/services/rentApi.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') url.searchParams.set(k, v);
  }
  return url.toString();
}

// Small helper: fetch with timeout + better errors
async function fetchJson(input, init = {}, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal, headers: {
      Accept: 'application/json',
      ...(init.headers || {}),
    }});
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      // Try to parse JSON error if present
      let detail = text;
      try { detail = JSON.parse(text)?.message || text; } catch {}
      throw new Error(`${init.method || 'GET'} ${typeof input === 'string' ? input : input.url} -> ${res.status} ${res.statusText} ${detail || ''}`.trim());
    }
    return text ? JSON.parse(text) : null;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request timed out');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function getInvoices({ month, propertyId, tenantId } = {}) {
  const url = buildUrl('/owner/rent/invoices', { month, propertyId, tenantId });
  return fetchJson(url);
}

export async function getPayments({ month, propertyId, tenantId } = {}) {
  const url = buildUrl('/owner/rent/payments', { month, propertyId, tenantId });
  return fetchJson(url);
}

export async function generateInvoices({ month, dueDate }) {
  const url = `${API_BASE}/owner/rent/generate`;
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, dueDate }),
  });
}

export async function createReceipt({ invoiceId, amountPaid, paymentMethod }) {
  const url = `${API_BASE}/owner/rent/receipt`;
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId, amountPaid, paymentMethod }),
  });
}
