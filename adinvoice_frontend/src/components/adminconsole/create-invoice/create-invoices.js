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

  const [errors, setErrors] = useState({});
  const [viewInvoice, setViewInvoice] = useState(false);

  // ✅ Field-level validation (runs for each change)
  const validateField = (name, value) => {
    let error = "";

    if (name === "invoiceNumber" && !value.trim()) {
      error = "Invoice number is required.";
    }

    if (name === "clientName" && !value.trim()) {
      error = "Client name is required.";
    }

    if (name === "email") {
      if (!value.trim()) error = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email format.";
    }

    if (name === "phone") {
      if (!value.trim()) error = "Phone number is required.";
      else if (!/^\d{10}$/.test(value)) error = "Phone must be 10 digits.";
    }

    if (name === "amount" && (parseFloat(value) || 0) <= 0) {
      error = "Amount must be greater than 0.";
    }

    if (name === "dueDate" && !value) {
      error = "Due date is required.";
    }

    return error;
  };

  // ✅ On change: update state + run validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = ["amount", "tax", "discount"].includes(name)
      ? parseFloat(value) || 0
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, processedValue),
    }));
  };

  // ✅ Full form validation (for final submit)
  const validateForm = () => {
    let newErrors = {};
    for (let key in formData) {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Save + API call
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setInvoices([...invoices, formData]);

      const response = await fetch("https://api.example.com/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit invoice");

      const result = await response.json();
      console.log("Invoice saved:", result);

      setViewInvoice(true);
    } catch (error) {
      console.error("Error submitting invoice:", error);
      alert("Failed to submit invoice. Please try again.");
    }
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
                {/* Invoice Number */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    className={`form-control ${errors.invoiceNumber ? "is-invalid" : ""}`}
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="INV-1001"
                  />
                  {errors.invoiceNumber && (
                    <div className="invalid-feedback">{errors.invoiceNumber}</div>
                  )}
                </div>

                {/* Client Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    className={`form-control ${errors.clientName ? "is-invalid" : ""}`}
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Enter client name"
                  />
                  {errors.clientName && (
                    <div className="invalid-feedback">{errors.clientName}</div>
                  )}
                </div>

                {/* Billing Address */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Billing Address</label>
                  <textarea
                    name="billingAddress"
                    className="form-control"
                    value={formData.billingAddress}
                    onChange={handleChange}
                  />
                </div>

                {/* Shipping Address */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Shipping Address</label>
                  <textarea
                    name="shippingAddress"
                    className="form-control"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                  />
                </div>

                {/* Email & Phone */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>
                </div>

                {/* Amount, Tax, Discount */}
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      className={`form-control ${errors.amount ? "is-invalid" : ""}`}
                      value={formData.amount}
                      onChange={handleChange}
                    />
                    {errors.amount && (
                      <div className="invalid-feedback">{errors.amount}</div>
                    )}
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

                {/* Due Date & Status */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      className={`form-control ${errors.dueDate ? "is-invalid" : ""}`}
                      value={formData.dueDate}
                      onChange={handleChange}
                    />
                    {errors.dueDate && (
                      <div className="invalid-feedback">{errors.dueDate}</div>
                    )}
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

                {/* Notes */}
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
