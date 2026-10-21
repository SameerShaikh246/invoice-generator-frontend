import { useEffect, useState } from "react";
import { FileText, Printer, Mail, Save } from "lucide-react";
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
    {
      id: "item-1",
      description: "Website design",
      quantity: 1,
      unitPrice: 1200,
    },
    {
      id: "item-2",
      description: "Frontend development",
      quantity: 8,
      unitPrice: 75,
    },
  ],
  discount: 0,
  taxRate: 10,
  customFields: [
    {
      id: "field-1",
      label: "Payment terms",
      value: "Net 14",
      visible: true,
    },
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

  return (
    <main className="app-shell">
      <header className="app-header no-print">
        <a className="brand" href="/" aria-label="Invoice Studio home">
          <span className="brand-icon">
            <FileText size={21} />
          </span>
          <span>
            Invoice<span className="brand-light">Studio</span>
          </span>
        </a>

        <div className="header-actions">
          <span className="draft-label">
            <span className="draft-dot" /> Draft
          </span>
          <button
            className="button button-primary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </header>

      <section className="workspace-heading no-print">
        <div>
          <p className="eyebrow">WORKSPACE / INVOICES</p>
          <h1>Create an invoice</h1>
          <p>Edit your details and preview your invoice in real time.</p>
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
                {isSaving ? "Saving..." : "Save Invoice"}
              </button>

              <button
                type="button"
                className="button button-light"
                onClick={handleLoadInvoice}
                disabled={isLoading || !savedInvoiceId}
              >
                {isLoading ? "Loading..." : "Load Saved"}
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
                {isSendingEmail ? "Sending..." : "Send Invoice"}
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
          <h2>Invoice History</h2>
          <button
            type="button"
            onClick={refreshInvoiceHistory}
            disabled={historyLoading}
          >
            {historyLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {historyError && <p role="alert">{historyError}</p>}

        {historyLoading ? (
          <p>Loading saved invoices...</p>
        ) : invoiceHistory.length === 0 ? (
          <p>No saved invoices yet.</p>
        ) : (
          <div className="history-list">
            {invoiceHistory.map((saved) => {
              const totals = calculateInvoice({
                items: saved.data.items || [],
                discount: saved.data.discount || 0,
                taxRate: saved.data.taxRate || 0,
              });

              return (
                <article className="history-item" key={saved.id}>
                  <div>
                    <strong>{saved.invoiceNumber}</strong>
                    <p>{saved.data.customerName || "No customer name"}</p>
                    <small>
                      Saved: {new Date(saved.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="history-total">
                    <strong>{formatUSD(totals.total)}</strong>
                    <button
                      type="button"
                      onClick={() => handleOpenSavedInvoice(saved.id)}
                    >
                      View / Load
                    </button>
                  </div>
                </article>
              );
            })}
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
