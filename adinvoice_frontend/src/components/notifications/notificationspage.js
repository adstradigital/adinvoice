"use client";
import React, { useEffect, useState } from "react";
import {
  Bell,
  Trash2,
  AlertCircle,
  Info,
  Megaphone,
  Calendar,
  User,
} from "lucide-react";
import { fetchClientAdminNotifications } from "@../../../Api/api_clientadmin";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL"); // ALL, ANNOUNCEMENT, UPDATE

  // ✅ Load notifications from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchClientAdminNotifications();
        const data = response.items || []; // ✅ extract items array
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    loadData();
  }, []);

  const deleteNotification = (id) => {
    console.log("Delete notification:", id);
    // TODO: call API to delete notification
  };

  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case "alert":
        return <AlertCircle className="text-warning me-2" />;
      case "announcement":
        return <Megaphone className="text-warning me-2" />;
      case "update":
        return <Info className="text-primary me-2" />;
      default:
        return <Info className="text-primary me-2" />;
    }
  };

  // ✅ Filter notifications based on selected type
  const filteredNotifications =
    filter === "ALL"
      ? notifications
      : notifications.filter((n) => n.notification_type.toUpperCase() === filter);

  return (
    <div className="card shadow p-4">
      {/* Header */}
      <h4 className="mb-3 d-flex align-items-center border-bottom pb-2">
        <Bell className="me-2 text-primary" /> Notifications
      </h4>

      {/* Filter buttons */}
      <div className="mb-3 d-flex gap-2">
        <button
          className={`btn btn-sm ${filter === "ALL" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setFilter("ALL")}
        >
          All
        </button>
        <button
          className={`btn btn-sm ${filter === "ANNOUNCEMENT" ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => setFilter("ANNOUNCEMENT")}
        >
          Announcements
        </button>
        <button
          className={`btn btn-sm ${filter === "UPDATE" ? "btn-info" : "btn-outline-info"}`}
          onClick={() => setFilter("UPDATE")}
        >
          Updates
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <p className="text-muted text-center">No notifications available.</p>
      ) : (
        <ul className="list-group">
          {filteredNotifications.map((n) => (
            <li
              key={n.id}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div className="d-flex align-items-start">
                {getIcon(n.notification_type)}
                <div>
                  <div className="fw-bold">{n.notification_type}</div>
                  <div className="text-muted small">{n.message}</div>
                  <div className="text-muted small d-flex align-items-center mt-1">
                    <Calendar size={14} className="me-1" />
                    {new Date(n.created_at).toLocaleString()}
                    <User size={14} className="ms-3 me-1" /> {n.sender_type.replace("_", " ")}
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
    </div>
  );
}
