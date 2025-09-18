"use client";
import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import "./bulk-notification-sender.css";

export default function BulkNotificationSender() {
  const [form, setForm] = useState({
    title: "",
    type: "Email",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title || !form.message) {
      setStatus("⚠️ Please fill in all fields.");
      return;
    }

    // Simulated API call
    setTimeout(() => {
      setStatus(`✅ Notification sent successfully via ${form.type}`);
      setForm({ title: "", type: "Email", message: "" });
    }, 1000);
  };

  return (
    <div className="sender-container">
      <h2>✉️ Bulk Notification Sender</h2>

      <div className="sender-content">
        {/* Left side - Form */}
        <form className="sender-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Notification Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter notification title"
            />
          </div>

          <div className="form-group">
            <label>Notification Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="Push">Push</option>
            </select>
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              placeholder="Write your message here..."
            />
          </div>

          <button type="submit" className="send-btn">
            <FaPaperPlane /> Send Notification
          </button>
        </form>

        {/* Right side - Preview */}
        <div className="preview-panel">
          <h3>🔎 Live Preview</h3>
          <div className="preview-box">
            <h4>{form.title || "Notification Title"}</h4>
            <p className="preview-type">Type: {form.type}</p>
            <p>{form.message || "Your message will appear here..."}</p>
          </div>
        </div>
      </div>

      {status && <div className="status-message">{status}</div>}
    </div>
  );
}
