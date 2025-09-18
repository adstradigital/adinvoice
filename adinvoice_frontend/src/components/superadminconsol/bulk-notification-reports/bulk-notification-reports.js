"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import "./bulk-notification-reports.css";

const API_URL = "http://127.0.0.1:8000/api/bulk-notifications/"; // replace with your actual endpoint

export default function BulkNotificationReports() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 📌 Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // const response = await axios.get(API_URL);
      setReports(response.data); // expects an array from API
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // Filter reports based on search term
  const filteredReports = reports.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notification-report-container">
      <h2>📢 Bulk Notification Reports</h2>

      {/* Search */}
      <div className="report-actions">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
          {filteredReports.length > 0 ? (
            filteredReports.map((item, index) => (
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
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "10px" }}>
                No reports found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
