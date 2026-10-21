
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      result.message ||
      result.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return result;
}

export function saveInvoice(invoice) {
  return request("/api/invoices", {
    method: "POST",
    body: JSON.stringify(invoice),
  });
}

export function getInvoice(id) {
  return request(`/api/invoices/${encodeURIComponent(id)}`);
}

export function updateInvoice(id, invoice) {
  return request(`/api/invoices/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(invoice),
  });
}

export function sendInvoiceEmail(invoice) {
  return request("/api/invoices/email", {
    method: "POST",
    body: JSON.stringify(invoice),
  });
}

export function listInvoices() {
  return request("/api/invoices");
}

export { API_URL };
