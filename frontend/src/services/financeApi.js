//financeApi.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") url.searchParams.set(k, v);
  }
  return url.toString();
}

// Small helper: fetch with timeout + better errors
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
      let detail = text;
      try {
        detail = JSON.parse(text)?.message || text;
      } catch {}
      throw new Error(
        `${init.method || "GET"} ${
          typeof input === "string" ? input : input.url
        } -> ${res.status} ${res.statusText} ${detail || ""}`.trim()
      );
    }
    return text ? JSON.parse(text) : null;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Request timed out");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
// financeApi.js
export async function getFinanceReports({ type, month } = {}) {
  const url = buildUrl("/finance-reports", { type, month });
  return fetchJson(url);
}

export async function generateFinanceReport({ reportType, month, notes }) {
  const url = `${API_BASE}/finance-reports/generate`;
  return fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportType, month, notes }),
  });
}

export async function getFinanceReport(reportId) {
  const url = `${API_BASE}/finance-reports/${reportId}`;
  return fetchJson(url);
}


// (Optional) Export/download a report in CSV/PDF
export async function exportFinanceReport({ reportId, format = "pdf" }) {
  const url = buildUrl(`/owner/finance/finance-reports/${reportId}/export`, { format });
  return fetchJson(url);
}
