"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Invoices({ setActivePage }) {
  const [invoices, setInvoices] = useState([]);

  // ✅ Fetch invoices from API
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/invoices/") // replace with your Django API
      .then((res) => setInvoices(res.data))
      .catch((err) => console.error("Error fetching invoices:", err));
  }, []);

  // ✅ Delete invoice API
  const handleDeleteInvoice = (id) => {
    axios
      .delete(`http://127.0.0.1:8000/api/invoices/${id}/`)
      .then(() => {
        setInvoices(invoices.filter((invoice) => invoice.id !== id));
      })
      .catch((err) => console.error("Error deleting invoice:", err));
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Invoices</h3>
        <button
          className="btn btn-primary"
          onClick={() => setActivePage("create-invoices")}
        >
          + Create Invoice
        </button>
      </div>

      {/* Invoice Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Number</th>
                <th>Status</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Amount Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.number}</td>
                    <td>
                      <span
                        className={`badge ${
                          invoice.status === "Paid"
                            ? "bg-success"
                            : invoice.status === "Draft"
                            ? "bg-secondary"
                            : "bg-warning"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td>{invoice.date}</td>
                    <td>{invoice.customer}</td>
                    <td>₹{invoice.total}</td>
                    <td>₹{invoice.due}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
