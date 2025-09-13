"use client";
import React, { useState } from "react";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "Medium",
  });
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ticket Submitted:", { ...formData, file });
    setSuccess(true);
    setFormData({ subject: "", description: "", priority: "Medium" });
    setFile(null);

    // Hide success message after 3s
    setTimeout(() => setSuccess(false), 3000);
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

        <form onSubmit={handleSubmit}>
          {/* Subject */}
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

          {/* Description */}
          <div className="mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your issue in detail"
              required
            ></textarea>
          </div>


          {/* File Upload */}
          <div className="mb-3">
            <label className="form-label fw-bold">Attach File (Optional)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {/* Submit Button */}
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
