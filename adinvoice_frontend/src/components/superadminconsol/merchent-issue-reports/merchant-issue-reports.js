"use client";
import React, { useEffect, useState } from "react";
import { fetchTicketsSuperAdmin, updateTicketStatus } from "@../../../Api/api_superadmin";
import "./merchant-issue-reports.css"; // Import your CSS file

export default function MerchantIssueReports() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTicketsSuperAdmin();
      setTickets(data.tickets || data || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError(err.detail || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      await updateTicketStatus(ticketId, status);
      // Update the ticket locally without reload
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
      );
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  return (
    <div className="issue-container">
      <h3>Merchant Issue Reports</h3>

      {loading && <p>Loading tickets...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && tickets.length === 0 && <p>No tickets found.</p>}

      {!loading && tickets.length > 0 && (
        <table className="issue-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Subject</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.tenant || "N/A"}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.description}</td>
                <td>{new Date(ticket.created_at).toLocaleString()}</td>
                <td>
                  <span className={`status ${ticket.status}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="issue-actions">
                  {ticket.status !== "resolved" && (
                    <button
                      className="resolve-btn"
                      onClick={() => handleStatusChange(ticket.id, "resolved")}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {ticket.status !== "pending" && (
                    <button
                      className="resolve-btn"
                      onClick={() => handleStatusChange(ticket.id, "pending")}
                    >
                      Mark Pending
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="resolve-btn" onClick={loadTickets} style={{ marginTop: "15px" }}>
        Refresh Tickets
      </button>
    </div>
  );
}
