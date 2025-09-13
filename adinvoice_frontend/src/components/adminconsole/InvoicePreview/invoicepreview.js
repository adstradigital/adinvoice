"use client";
import React, { useState } from "react";

export default function CreateProposalPage({ onBack }) {
  const [formData, setFormData] = useState({
    proposalNumber: "",
    clientName: "",
    title: "",
    description: "",
    amount: "",
    validUntil: "",
  });

  const [errors, setErrors] = useState({});
  const [viewProposal, setViewProposal] = useState(false);

  // ✅ Field-level validation
  const validateField = (name, value) => {
    let error = "";

    if (name === "proposalNumber" && !value.trim()) {
      error = "Proposal number is required.";
    }

    if (name === "clientName" && value.trim().length < 3) {
      error = "Client name must be at least 3 characters.";
    }

    if (name === "title" && !value.trim()) {
      error = "Proposal title is required.";
    }

    if (name === "description" && !value.trim()) {
      error = "Proposal description is required.";
    }

    if (name === "amount") {
      if (!value.trim()) error = "Amount is required.";
      else if (isNaN(value) || parseFloat(value) <= 0) {
        error = "Amount must be a valid number greater than 0.";
      }
    }

    if (name === "validUntil" && !value) {
      error = "Valid until date is required.";
    }

    return error;
  };

  // ✅ On change + live validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // ✅ Final form validation
  const validateForm = () => {
    let newErrors = {};
    for (let key in formData) {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Save proposal (preview instead of API for now)
  const handleSave = () => {
    if (!validateForm()) return;
    setViewProposal(true);
  };

  return (
    <div className="container-fluid py-5 bg-light" style={{ minHeight: "100vh" }}>
      {!viewProposal ? (
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card shadow border-0 p-4">
              <h3 className="mb-4 text-primary fw-bold">Create Proposal</h3>
              <form>
                {/* Proposal Number */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Proposal Number</label>
                  <input
                    type="text"
                    name="proposalNumber"
                    className={`form-control ${errors.proposalNumber ? "is-invalid" : ""}`}
                    value={formData.proposalNumber}
                    onChange={handleChange}
                    placeholder="PRO-1001"
                  />
                  {errors.proposalNumber && (
                    <div className="invalid-feedback">{errors.proposalNumber}</div>
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

                {/* Proposal Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Proposal Title</label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Website Redesign Proposal"
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    name="description"
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter proposal details..."
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>

                {/* Amount & Valid Until */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
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
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Valid Until</label>
                    <input
                      type="date"
                      name="validUntil"
                      className={`form-control ${errors.validUntil ? "is-invalid" : ""}`}
                      value={formData.validUntil}
                      onChange={handleChange}
                    />
                    {errors.validUntil && (
                      <div className="invalid-feedback">{errors.validUntil}</div>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSave}
                  >
                    💾 Save Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // ✅ Preview Section
        <div className="col-md-8 mx-auto">
          <div className="card shadow border-0 p-4">
            <h4 className="mb-3 text-primary fw-bold">Proposal Preview</h4>
            <p><strong>Proposal #:</strong> {formData.proposalNumber}</p>
            <p><strong>Client:</strong> {formData.clientName}</p>
            <p><strong>Title:</strong> {formData.title}</p>
            <p><strong>Description:</strong> {formData.description}</p>
            <p><strong>Amount:</strong> ₹{formData.amount}</p>
            <p><strong>Valid Until:</strong> {formData.validUntil}</p>

            <div className="d-flex justify-content-end">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setViewProposal(false)}
              >
                🔙 Back
              </button>
              <button className="btn btn-primary">📥 Export as PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
