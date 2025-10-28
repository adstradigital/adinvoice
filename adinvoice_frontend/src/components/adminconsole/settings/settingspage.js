"use client";
import React, { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    username: "admin_user",
    email: "admin@example.com",
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("🚧 Settings features are under development. UI changes only!");
  };

  return (
    <div className="card shadow p-4" style={{ maxWidth: "600px", margin: "auto" }}>
      <h4 className="mb-2">⚙️ Settings</h4>
      <p className="text-muted mb-3">
        🚧 This page is still under development. Some features are disabled for now.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Profile Info */}
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            value={settings.username}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={settings.email}
            onChange={handleChange}
          />
        </div>

        {/* Features Coming Soon */}
        <div className="mb-3">
          <label className="form-label">Language</label>
          <select className="form-select" disabled title="Coming soon">
            <option>English</option>
          </select>
          <small className="text-warning">Coming Soon 🔒</small>
        </div>

        <div className="mb-3">
          <label className="form-label">Theme</label>
          <select className="form-select" disabled title="Coming soon">
            <option>Light</option>
          </select>
          <small className="text-warning">Coming Soon 🔒</small>
        </div>

        {/* Notifications Toggle */}
        <div className="form-check mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            id="notifications"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="notifications">
            Enable Notifications
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Save Settings
        </button>
      </form>
    </div>
  );
}
