
import { calculateInvoice, formatUSD } from "../utils/invoiceCalculations";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

export default function InvoicePreview({ invoice }) {
  const totals = calculateInvoice(invoice);

  return (
    <article className="invoice-paper" id="invoice-document">
      <header className="invoice-top">
        <div>
          <p className="invoice-kicker">INVOICE</p>
          <h2>{invoice.invoiceNumber || "INV-DRAFT"}</h2>
        </div>
        <div className="invoice-brand-mark">
          {invoice.businessName?.trim()?.charAt(0)?.toUpperCase() || "B"}
        </div>
      </header>

      <div className="invoice-divider" />

      <section className="invoice-parties">
        <div>
          <p className="preview-label">FROM</p>
          <h3>{invoice.businessName || "Your business"}</h3>
          <p className="preserve-lines">
            {invoice.businessAddress || "Business address"}
          </p>
          <p>{invoice.businessEmail || "Business email"}</p>
        </div>

        <div>
          <p className="preview-label">BILL TO</p>
          <h3>{invoice.customerName || "Customer name"}</h3>
          <p className="preserve-lines">
            {invoice.customerAddress || "Customer address"}
          </p>
          <p>{invoice.customerEmail || "Customer email"}</p>
        </div>
      </section>

      <section className="invoice-meta">
        <div>
          <span>Invoice date</span>
          <strong>{formatDate(invoice.issueDate)}</strong>
        </div>
        <div>
          <span>Due date</span>
          <strong>{formatDate(invoice.dueDate)}</strong>
        </div>
      </section>

      {invoice.customFields.some(
        (field) => field.visible && (field.label || field.value)
      ) && (
        <section className="preview-custom-fields">
          {invoice.customFields
            .filter(
              (field) => field.visible && (field.label || field.value)
            )
            .map((field) => (
              <div key={field.id}>
                <span>{field.label || "Custom field"}</span>
                <strong>{field.value || "—"}</strong>
              </div>
            ))}
        </section>
      )}

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th className="number-cell">Qty</th>
            <th className="number-cell">Price</th>
            <th className="number-cell">Amount</th>
          </tr>
        </thead>
        <tbody>
          {totals.lineItems.map((item) => (
            <tr key={item.id}>
              <td>{item.description || "Untitled item"}</td>
              <td className="number-cell">{item.quantity || 0}</td>
              <td className="number-cell">
                {formatUSD(Number(item.unitPrice) || 0)}
              </td>
              <td className="number-cell">
                {formatUSD(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="invoice-bottom">
        <div className="invoice-notes">
          <p className="preview-label">NOTES</p>
          <p className="preserve-lines">
            {invoice.notes || "Thank you for your business."}
          </p>
        </div>

        <div className="totals">
          <div>
            <span>Subtotal</span>
            <span>{formatUSD(totals.subtotal)}</span>
          </div>
          <div>
            <span>Discount</span>
            <span>−{formatUSD(totals.discount)}</span>
          </div>
          <div>
            <span>Tax ({Number(invoice.taxRate) || 0}%)</span>
            <span>{formatUSD(totals.tax)}</span>
          </div>
          <div className="grand-total">
            <strong>Total due</strong>
            <strong>{formatUSD(totals.total)}</strong>
          </div>
        </div>
      </section>

      <footer className="invoice-footer">
        Thank you for your business.
      </footer>
    </article>
  );
}
