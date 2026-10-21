import { useEffect, useState } from "react";
import { FileText, Printer, Mail, Save, Search, FolderOpen } from "lucide-react";
import InvoiceEditor from "./components/InvoiceEditor";
import InvoicePreview from "./components/InvoicePreview";
import {
  listInvoices,
  getInvoice,
  saveInvoice,
  sendInvoiceEmail,
} from "./utils/api";
import { calculateInvoice, formatUSD } from "./utils/invoiceCalculations";

import "./index.css";

const initialInvoice = {
  businessName: "Northstar Creative Studio",
  businessEmail: "hello@northstar.example",
  businessAddress: "125 Market Street\nSan Francisco, CA 94105",
  customerName: "Olivia Bennett",
  customerEmail: "olivia@example.com",
  customerAddress: "48 Park Avenue\nNew York, NY 10016",
  invoiceNumber: "INV-2026-001",
  issueDate: "2026-10-21",
  dueDate: "2026-11-04",
  notes: "Payment is due within 14 days. Thank you for your business!",
  items: [
    { id: "item-1", description: "Website design", quantity: 1, unitPrice: 1200 },
    { id: "item-2", description: "Frontend development", quantity: 8, unitPrice: 75 },
  ],
  discount: 0,
  taxRate: 10,
  customFields: [
    { id: "field-1", label: "Payment terms", value: "Net 14", visible: true },
  ],
};

export default function App() {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [savedInvoiceId, setSavedInvoiceId] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [search, setSearch] = useState("");

  const refreshInvoiceHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const result = await listInvoices();
      setInvoiceHistory(result.invoices || []);
    } catch (error) {
      setHistoryError(error.message || "Could not load invoice history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    refreshInvoiceHistory();
  }, []);

  const handleSaveInvoice = async () => {
    setIsSaving(true);
    setSaveStatus("");

    try {
      const result = await saveInvoice(invoice);
      const id = result.invoice?.id;

      if (!id) {
        throw new Error("Invoice was saved, but no invoice ID was returned.");
      }

      setSavedInvoiceId(id);
      await refreshInvoiceHistory();
      setSaveStatus(`Invoice saved successfully. ID: ${id}`);
    } catch (error) {
      setSaveStatus(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenSavedInvoice = async (id) => {
    setSaveStatus("");

    try {
      const result = await getInvoice(id);
      const savedData = result.invoice?.data;

      if (!savedData) {
        throw new Error("Invoice data was not found.");
      }

      setInvoice(savedData);
      setSavedInvoiceId(id);
      setSaveStatus(`Loaded invoice ${savedData.invoiceNumber}.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSaveStatus(`Could not load invoice: ${error.message}`);
    }
  };

  const handleLoadInvoice = async () => {
    if (!savedInvoiceId) {
      setSaveStatus("Save an invoice first so there is an ID to load.");
      return;
    }

    setIsLoading(true);
    setSaveStatus("");

    try {
      const result = await getInvoice(savedInvoiceId);
      const savedData = result.invoice?.data;

      if (!savedData) {
        throw new Error("The saved invoice data was not returned.");
      }

      setInvoice(savedData);
      setSaveStatus("Invoice loaded successfully.");
    } catch (error) {
      setSaveStatus(`Load failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvoiceEmail = async () => {
    if (!invoice.customerEmail?.trim()) {
      setSaveStatus("Enter the customer's email address first.");
      return;
    }

    const confirmed = window.confirm(
      `Send invoice ${invoice.invoiceNumber} to ${invoice.customerEmail}?`
    );

    if (!confirmed) return;

    setIsSendingEmail(true);
    setSaveStatus("");

    try {
      const result = await sendInvoiceEmail(invoice);
      setSaveStatus(result.message || "Invoice email sent successfully.");
    } catch (error) {
      setSaveStatus(`Email failed: ${error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  /* ---- display-only values ---- */
  const currentTotal = calculateInvoice(invoice).total;

  const historyRows = invoiceHistory.map((saved) => {
    const data = saved.data || {};
    return {
      ...saved,
      data,
      total: calculateInvoice({
        items: data.items || [],
        discount: data.discount || 0,
        taxRate: data.taxRate || 0,
      }).total,
    };
  });

  const totalBilled = historyRows.reduce((sum, row) => sum + row.total, 0);

  const query = search.trim().toLowerCase();
  const visibleRows = historyRows.filter(
    (row) =>
      !query ||
      (row.invoiceNumber || "").toLowerCase().includes(query) ||
      (row.data.customerName || "").toLowerCase().includes(query)
  );

  return (
    <main className="app-shell">
      <header className="app-header no-print">
        <a className="brand" href="/" aria-label="Invoice Studio home">
          <span className="brand-icon">
            <FileText size={19} />
          </span>
          <span>
            Invoice<span className="brand-light">Studio</span>
          </span>
        </a>

        <div className="header-actions">
          <span className="draft-label">
            <span className="draft-dot" /> {savedInvoiceId ? "Saved" : "Draft"}
          </span>
          <button className="button button-primary" onClick={() => window.print()}>
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </header>

      <section className="workspace-heading no-print">
        <div>
          <p className="eyebrow">Invoices / New invoice</p>
          <h1>Create an invoice</h1>
          <p>Edit your details and preview your invoice in real time.</p>
        </div>

        <div className="stats">
          <div className="stat">
            <span>This invoice</span>
            <strong>{formatUSD(currentTotal)}</strong>
          </div>
          <div className="stat">
            <span>Saved invoices</span>
            <strong>{historyRows.length}</strong>
          </div>
          <div className="stat">
            <span>Total billed</span>
            <strong>{formatUSD(totalBilled)}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="editor-column no-print">
          <InvoiceEditor invoice={invoice} setInvoice={setInvoice} />
        </div>

        <aside className="preview-column">
          <div className="preview-heading no-print">
            <div className="preview-title">
              <h2>Live preview</h2>
              <p>Updates as you edit</p>
            </div>

            <div className="preview-actions">
              <button
                type="button"
                className="button button-light"
                onClick={handleSaveInvoice}
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                className="button button-light"
                onClick={handleLoadInvoice}
                disabled={isLoading || !savedInvoiceId}
              >
                <FolderOpen size={16} />
                {isLoading ? "Loading..." : "Load saved"}
              </button>

              <button
                type="button"
                className="button button-light"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Print / PDF
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={handleSendInvoiceEmail}
                disabled={isSendingEmail}
              >
                <Mail size={16} />
                {isSendingEmail ? "Sending..." : "Send invoice"}
              </button>
            </div>
          </div>

          <div className="no-print invoice-actions">
            {saveStatus && <p role="status">{saveStatus}</p>}
          </div>

          <InvoicePreview invoice={invoice} />
        </aside>
      </section>

      <section className="invoice-history no-print">
        <div className="section-heading">
          <div>
            <h2>Invoice history</h2>
            <p className="section-sub">Open any saved invoice to keep editing it.</p>
          </div>

          <div className="history-tools">
            <label className="search-box">
              <Search size={15} />
              <input
                type="search"
                placeholder="Search invoice or customer"
                aria-label="Search invoices"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={refreshInvoiceHistory}
              disabled={historyLoading}
            >
              {historyLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {historyError && <p role="alert">{historyError}</p>}

        {historyLoading ? (
          <p className="history-empty">Loading saved invoices...</p>
        ) : historyRows.length === 0 ? (
          <div className="history-empty">
            <strong>No saved invoices yet</strong>
            <p>Fill in the form above and select Save to see it here.</p>
          </div>
        ) : visibleRows.length === 0 ? (
          <p className="history-empty">No invoices match "{search}".</p>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Saved on</th>
                  <th className="num">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((saved) => (
                  <tr
                    key={saved.id}
                    className={saved.id === savedInvoiceId ? "is-active" : ""}
                  >
                    <td data-label="Invoice">
                      <strong>{saved.invoiceNumber}</strong>
                    </td>
                    <td data-label="Customer">
                      {saved.data.customerName || "No customer name"}
                      {saved.data.customerEmail && (
                        <small>{saved.data.customerEmail}</small>
                      )}
                    </td>
                    <td data-label="Saved on">
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </td>
                    <td data-label="Amount" className="num">
                      <strong>{formatUSD(saved.total)}</strong>
                    </td>
                    <td className="action">
                      <button
                        type="button"
                        onClick={() => handleOpenSavedInvoice(saved.id)}
                      >
                        {saved.id === savedInvoiceId ? "Open" : "View / Load"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="app-footer no-print">
        <span>Invoice Studio</span>
        <span>Secure, simple invoicing</span>
      </footer>
    </main>
  );
}