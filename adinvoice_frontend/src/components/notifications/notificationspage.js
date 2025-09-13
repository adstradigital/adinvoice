"use client";
import React from "react";
import {
  Bell,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  Megaphone,
  Calendar,
  User,
} from "lucide-react";

export default function NotificationsPage() {
  const notifications = []; // Empty array, ready for API data
  const announcements = []; // Empty array, ready for API data

  const deleteNotification = (id) => {
    // Placeholder function for future API delete
    console.log("Delete notification:", id);
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="text-success me-2" />;
      case "warning":
        return <AlertCircle className="text-warning me-2" />;
      case "info":
      default:
        return <Info className="text-primary me-2" />;
    }
  };

  return (
    <div className="card shadow p-4">
      {/* Notifications Section */}
      <h4 className="mb-3 d-flex align-items-center border-bottom pb-2">
        <Bell className="me-2 text-primary" /> Notifications
      </h4>

      {notifications.length === 0 ? (
        <p className="text-muted text-center">No new notifications.</p>
      ) : (
        <ul className="list-group mb-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-start">
                {getIcon(n.type)}
                <div>
                  <div className="fw-bold">{n.title}</div>
                  <div className="text-muted small">{n.message}</div>
                  <div className="text-muted small">
                    <Calendar size={14} className="me-1" /> {n.date} 
                    <span className="ms-3">⚡ Priority: {n.priority}</span>
                  </div>
                </div>
              </div>
              <button
                className="btn btn-sm btn-light text-danger"
                onClick={() => deleteNotification(n.id)}
                title="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Announcements Section */}
      <h4 className="mb-3 d-flex align-items-center border-bottom pb-2">
        <Megaphone className="me-2 text-warning" /> Announcements
      </h4>

      {announcements.length === 0 ? (
        <p className="text-muted text-center">No announcements available.</p>
      ) : (
        <ul className="list-group">
          {announcements.map((a) => (
            <li key={a.id} className="list-group-item d-flex flex-column">
              <div className="fw-bold">{a.title}</div>
              <div className="text-muted small">{a.message}</div>
              <div className="text-muted small d-flex align-items-center mt-1">
                <Calendar size={14} className="me-1" /> {a.date}
                <User size={14} className="ms-3 me-1" /> {a.by}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
