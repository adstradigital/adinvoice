"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import "./merchant-issue-reports.css";

const API_URL = "http://127.0.0.1:8000/api/merchant-issues/"; // replace with your actual endpoint

export default function MerchantIssueReports() {
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 📌 Fetch issues from API on mount
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      // const response = await axios.get(API_URL);
      setIssues(response.data); // expects an array from API
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  // 📌 Mark issue as resolved
  const handleResolve = async (id) => {
    try {
      await axios.put(`${API_URL}${id}/`, { status: "Resolved" });
      // Refresh issues after update
      fetchIssues();
    } catch (error) {
      console.error("Error resolving issue:", error);
    }
  };

  // Filter issues based on search term
  const filteredIssues = issues.filter(
    (item) =>
      item.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
