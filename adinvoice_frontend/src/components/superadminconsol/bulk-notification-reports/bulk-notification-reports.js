"use client";
import { useState } from "react";
import { FaSearch, FaCheckCircle, FaTimesCircle, FaPaperPlane } from "react-icons/fa";
import "./bulk-notification-reports.css";

export default function BulkNotificationReports() {
  const [reports, setReports] = useState([
    { id: 1, title: "Promo Offer", type: "Email", recipients: 1200, status: "Sent", date: "2025-09-10" },
    { id: 2, title: "System Alert", type: "SMS", recipients: 350, status: "Failed", date: "2025-09-12" },
    { id: 3, title: "Invoice Reminder", type: "Push", recipients: 500, status: "Sent", date: "2025-09-14" },
  ]);

  return (
    <div className="notification-report-container">
      <h2>📢 Bulk Notification Reports</h2>

      {/* Search */}
      <div className="report-actions">
        <div className="search-bar">
          <FaSearch />
          <input type="text" placeholder="Search reports..." />
        </div>
      </div>

      {/* Table */}
      <table className="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Type</th>
            <th>Recipients</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.title}</td>
              <td>{item.type}</td>
              <td>{item.recipients}</td>
              <td>{item.date}</td>
              <td>
                {item.status === "Sent" ? (
                  <span className="status sent">
                    <FaCheckCircle /> {item.status}
                  </span>
                ) : (
                  <span className="status failed">
                    <FaTimesCircle /> {item.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
