
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

export default function InvoiceEditor({ invoice, setInvoice }) {
    const update = (field, value) => {
        setInvoice((current) => ({ ...current, [field]: value }));
    };

    const updateItem = (id, field, value) => {
        setInvoice((current) => ({
            ...current,
            items: current.items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    };

    const addItem = () => {
        setInvoice((current) => ({
            ...current,
            items: [
                ...current.items,
                {
                    id: crypto.randomUUID(),
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                },
            ],
        }));
    };

    const removeItem = (id) => {
        setInvoice((current) => ({
            ...current,
            items: current.items.filter((item) => item.id !== id),
        }));
    };

    const updateCustomField = (id, field, value) => {
        setInvoice((current) => ({
            ...current,
            customFields: current.customFields.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    };

    const input = (label, field, placeholder, multiline = false) => (
        <label className="field" key={field}>
            <span>{label}</span>
            {multiline ? (
                <textarea
                    value={invoice[field]}
                    placeholder={placeholder}
                    onChange={(e) => update(field, e.target.value)}
                    rows={3}
                />
            ) : (
                <input
                    value={invoice[field]}
                    placeholder={placeholder}
                    onChange={(e) => update(field, e.target.value)}
                />
            )}
        </label>
    );

    return (
        <div className="editor">
            <section className="panel">
                <div className="panel-heading">
                    <span className="section-number">01</span>
                    <div>
                        <h2>Business details</h2>
                        <p>Who is issuing this invoice?</p>
                    </div>
                </div>
                <div className="field-grid">
                    {input("Business name", "businessName", "Northstar Studio")}
                    {input("Business email", "businessEmail", "hello@example.com")}
                    {input("Business address", "businessAddress", "Address, city, ZIP", true)}
                </div>
            </section>

            <section className="panel">
                <div className="panel-heading">
                    <span className="section-number">02</span>
                    <div>
                        <h2>Bill to</h2>
                        <p>Customer information</p>
                    </div>
                </div>
                <div className="field-grid">
                    {input("Customer name", "customerName", "Customer name")}
                    {input("Customer email", "customerEmail", "customer@example.com")}
                    {input("Customer address", "customerAddress", "Address, city, ZIP", true)}
                </div>
            </section>

            <section className="panel">
                <div className="panel-heading">
                    <span className="section-number">03</span>
                    <div>
                        <h2>Invoice details</h2>
                        <p>Dates and reference</p>
                    </div>
                </div>
                <div className="field-grid">
                    {input("Invoice number", "invoiceNumber", "INV-2026-001")}

                    <label className="field">
                        <span>Issue date</span>
                        <input
                            type="date"
                            value={invoice.issueDate}
                            onChange={(e) => update("issueDate", e.target.value)}
                        />
                    </label>

                    <label className="field">
                        <span>Due date</span>
                        <input
                            type="date"
                            value={invoice.dueDate}
                            onChange={(e) => update("dueDate", e.target.value)}
                        />
                    </label>
                </div>
            </section>

            <section className="panel">
                <div className="panel-heading">
                    <span className="section-number">04</span>
                    <div>
                        <h2>Line items</h2>
                        <p>Services and products billed</p>
                    </div>
                    <button className="button button-light" onClick={addItem}>
                        <Plus size={16} /> Add item
                    </button>
                </div>

                <div className="item-list">
                    {invoice.items.map((item, index) => (
                        <div className="item-row" key={item.id}>
                            <div className="item-description">
                                <span className="mini-label">Item {index + 1}</span>
                                <input
                                    aria-label={`Item ${index + 1} description`}
                                    value={item.description}
                                    placeholder="Service description"
                                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                />
                            </div>
                            <label className="field">
                                <span>Qty</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                                />
                            </label>
                            <label className="field">
                                <span>Unit price ($)</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                                />
                            </label>
                            <button
                                className="icon-button danger"
                                aria-label={`Remove item ${index + 1}`}
                                onClick={() => removeItem(item.id)}
                            >
                                <Trash2 size={17} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="panel">
                <div className="panel-heading">
                    <span className="section-number">05</span>
                    <div>
                        <h2>Adjustments</h2>
                        <p>Discount and tax</p>
                    </div>
                </div>
                <div className="field-grid">
                    <label className="field">
                        <span>Discount ($)</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={invoice.discount}
                            onChange={(e) => update("discount", e.target.value)}
                        />
                    </label>
                    <label className="field">
                        <span>Tax rate (%)</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={invoice.taxRate}
                            onChange={(e) => update("taxRate", e.target.value)}
                        />
                    </label>
                </div>
            </section>

            <section className="panel">
                <div className="panel-heading">
                    <span className="section-number">06</span>
                    <div>
                        <h2>Custom fields</h2>
                        <p>Add optional invoice information</p>
                    </div>
                    <button
                        className="button button-light"
                        onClick={() =>
                            update("customFields", [
                                ...invoice.customFields,
                                {
                                    id: crypto.randomUUID(),
                                    label: "Reference",
                                    value: "",
                                    visible: true,
                                },
                            ])
                        }
                    >
                        <Plus size={16} /> Add field
                    </button>
                </div>

                {invoice.customFields.map((field) => (
                    <div className="custom-row" key={field.id}>
                        <input
                            aria-label="Custom field label"
                            value={field.label}
                            onChange={(e) => updateCustomField(field.id, "label", e.target.value)}
                        />
                        <input
                            aria-label="Custom field value"
                            value={field.value}
                            onChange={(e) => updateCustomField(field.id, "value", e.target.value)}
                        />
                        <button
                            className="icon-button"
                            aria-label={field.visible ? "Hide field" : "Show field"}
                            onClick={() => updateCustomField(field.id, "visible", !field.visible)}
                        >
                            {field.visible ? <Eye size={17} /> : <EyeOff size={17} />}
                        </button>
                        <button
                            className="icon-button danger"
                            aria-label="Remove custom field"
                            onClick={() =>
                                update("customFields", invoice.customFields.filter((f) => f.id !== field.id))
                            }
                        >
                            <Trash2 size={17} />
                        </button>
                    </div>
                ))}
            </section>

            <section className="panel">
                <div className="panel-heading">
                    <span className="section-number">07</span>
                    <div>
                        <h2>Notes</h2>
                        <p>Payment instructions or a thank-you message</p>
                    </div>
                </div>
                {input("Invoice notes", "notes", "Thank you for your business.", true)}
            </section>
        </div>
    );
}
