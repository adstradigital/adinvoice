"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import InvoicePreview from "../InvoicePreview/invoicepreview";

export default function CreateInvoicePage({ invoices, setInvoices }) {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    clientName: "",
    billingAddress: "",
    shippingAddress: "",
    email: "",
    phone: "",
    amount: 0,
    tax: 0,
    discount: 0,
    dueDate: "",
    status: "Draft",
    notes: "",
  });

  const [viewInvoice, setViewInvoice] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["amount", "tax", "discount"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSave = () => {
    setInvoices([...invoices, formData]);
    setViewInvoice(true);
  };

  const handleBack = () => {
    setViewInvoice(false);
  };

  return (
    <div className="container-fluid py-5 bg-light" style={{ minHeight: "100vh" }}>
      {!viewInvoice ? (
        <div className="row">
          {/* Left Form */}
          <div className="col-md-9">
            <div className="card shadow border-0 p-4">
              <h3 className="mb-4 text-primary fw-bold">Create Invoice</h3>
              <form>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    className="form-control"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="INV-1001"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    className="form-control"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Enter client name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Billing Address</label>
                  <textarea
                    name="billingAddress"
                    className="form-control"
                    value={formData.billingAddress}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Shipping Address</label>
                  <textarea
                    name="shippingAddress"
                    className="form-control"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      className="form-control"
                      value={formData.amount}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Tax (₹)</label>
                    <input
                      type="number"
                      name="tax"
                      className="form-control"
                      value={formData.tax}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Discount (₹)</label>
                    <input
                      type="number"
                      name="discount"
                      className="form-control"
                      value={formData.discount}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      className="form-control"
                      value={formData.dueDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Notes / Remarks</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right Actions */}
          <div className="col-md-3 d-flex align-items-start">
            <div className="card shadow border-0 p-4 w-100">
              <h5 className="fw-bold text-secondary mb-3">Actions</h5>
              <button
                className="btn btn-success w-100 mb-2"
                onClick={handleSave}
              >
                💾 Save & Preview
              </button>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setViewInvoice(true)}
              >
                📄 View Dummy Invoice
              </button>
            </div>
          </div>
        </div>
      ) : (
        <InvoicePreview data={formData} onBack={handleBack} />
      )}
    </div>
  );
}
