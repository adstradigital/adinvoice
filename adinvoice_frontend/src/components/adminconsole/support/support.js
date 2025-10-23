"use client";
import React, { useState } from "react";
import { submitSupportTicket } from "../../../../Api/api_clientadmin";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    setLoading(true);

    try {
      const response = await submitSupportTicket(formData, file);
      console.log("✅ Support ticket submitted:", response);

      setSuccess(true);
      setFormData({ subject: "", description: "" });
      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("❌ Error submitting ticket:", err);

      let message = "Failed to submit ticket.";
      if (err.response && err.response.data) {
        // Backend error
        message = err.response.data.detail || JSON.stringify(err.response.data);
      } else if (err.message) {
        // Network or Axios error
        message = err.message;
      }

      setError(message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div
        className="card shadow-lg border-0 p-4"
        style={{ maxWidth: "600px", width: "100%" }}
      >
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
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
