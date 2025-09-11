"use client";

import { useState } from "react";
import Image from "next/image";
import "./request-listing.css";

export default function RequestListing() {
  const [requests, setRequests] = useState([
    { id: 1, name: "John Doe", company: "Tech Corp", status: "Pending" },
    { id: 2, name: "Jane Smith", company: "Biz Solutions", status: "Approved" },
    {
      id: 3,
      name: "David Miller",
      company: "Adinvoice Pvt Ltd",
      status: "Rejected",
    },
  ]);

  const handleApprove = (id) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Approved" } : req
      )
    );
  };

  const handleReject = (id) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Rejected" } : req
      )
    );
  };

  return (
    <div className="container-fluid p-4">
      {/* Company Header */}
      <div className="company-header d-flex align-items-center mb-4">
        <Image
          src="/logo.png"
          alt="Company Logo"
          width={50}
          height={50}
          className="company-logo me-3"
        />

        <h2 className="company-name">Adinvoice Admin Dashboard</h2>
      </div>

      {/* Page Title */}
      <h3 className="mb-3">Request Listing</h3>

      {/* Requests Table */}
      <div className="card p-3">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.name}</td>
                <td>{req.company}</td>
                <td>
                  <span
                    className={`badge ${
                      req.status === "Pending"
                        ? "bg-warning"
                        : req.status === "Approved"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => handleApprove(req.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleReject(req.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
