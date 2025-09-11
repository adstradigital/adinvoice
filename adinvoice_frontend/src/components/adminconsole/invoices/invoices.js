"use client";
import React from "react";

export default function Invoices({ invoices, setInvoices, setActivePage }) {
  const handleDeleteInvoice = (index) => {
    const newInvoices = [...invoices];
    newInvoices.splice(index, 1);
    setInvoices(newInvoices);
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
                invoices.map((invoice, index) => (
                  <tr key={index}>
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
                        onClick={() => handleDeleteInvoice(index)}
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
