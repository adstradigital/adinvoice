"use client";
import { useState } from "react";
import { FaSearch, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./merchant-issue-reports.css";

export default function MerchantIssueReports() {
  const [issues, setIssues] = useState([
    { id: 1, merchant: "ABC Traders", issue: "Payment delay", status: "Pending", date: "2025-09-12" },
    { id: 2, merchant: "XYZ Mart", issue: "Invoice mismatch", status: "Resolved", date: "2025-09-14" },
    { id: 3, merchant: "Global Store", issue: "Login issue", status: "Pending", date: "2025-09-15" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter issues based on search term
  const filteredIssues = issues.filter(
    (item) =>
      item.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mark issue as resolved
  const handleResolve = (id) => {
    setIssues(
      issues.map((issue) =>
        issue.id === id ? { ...issue, status: "Resolved" } : issue
      )
    );
  };

  return (
    <div className="issue-container">
      <h2>⚠️ Merchant Issue Reports</h2>

      {/* Top bar */}
      <div className="issue-actions">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <table className="issue-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Merchant</th>
            <th>Issue</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues.length > 0 ? (
            filteredIssues.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.merchant}</td>
                <td>{item.issue}</td>
                <td>{item.date}</td>
                <td>
                  {item.status === "Resolved" ? (
                    <span className="status resolved">
                      <FaCheckCircle /> {item.status}
                    </span>
                  ) : (
                    <span className="status pending">
                      <FaTimesCircle /> {item.status}
                    </span>
                  )}
                </td>
                <td>
                  {item.status !== "Resolved" && (
                    <button
                      className="resolve-btn"
                      onClick={() => handleResolve(item.id)}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "10px" }}>
                No issues found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
