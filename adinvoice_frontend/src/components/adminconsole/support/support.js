"use client";
import React, { useState } from "react";
import { submitSupportTicket } from "../../../../Api/index"; 

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitSupportTicket(formData, file); // ✅ now tenant is auto-included
      setSuccess(true);
      setFormData({ subject: "", description: "" });
      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || err.message || "Failed to submit ticket."
      );
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="card shadow-lg border-0 p-4" style={{ maxWidth: "600px", width: "100%" }}>
        <h3 className="mb-3 text-center text-primary">Submit a Support Request</h3>
        <p className="text-muted text-center">
          Please fill out the form below to raise an issue or request assistance.
        </p>

        {success && (
          <div className="alert alert-success" role="alert">
            ✅ Your ticket has been submitted successfully!
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Subject</label>
            <input
              type="text"
              className="form-control"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter subject of your issue"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your issue in detail"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Attach File (Optional)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary btn-lg">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
