"use client";
import React, { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    username: "admin_user",
    email: "admin@example.com",
    language: "English",
    theme: "Light",
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
    alert("✅ Settings saved successfully!");
  };

  return (
    <div className="card shadow p-4">
      <h4 className="mb-3">⚙️ Settings</h4>
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

        {/* Preferences */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Language</label>
            <select
              className="form-select"
              name="language"
              value={settings.language}
              onChange={handleChange}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Theme</label>
            <select
              className="form-select"
              name="theme"
              value={settings.theme}
              onChange={handleChange}
            >
              <option>Light</option>
              <option>Dark</option>
              <option>System Default</option>
            </select>
          </div>
        </div>

        {/* Notifications Toggle */}
        <div className="form-check mb-3">
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

        <button type="submit" className="btn btn-primary">
          Save Settings
        </button>
      </form>
    </div>
  );
}
