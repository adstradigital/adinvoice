"use client";
import React, { useState } from "react";

export default function ReceiptsPage() {
  const [showModal, setShowModal] = useState(false);

  // Open/Close modal
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">🧾 Receipts</h2>
        <button className="btn btn-primary shadow-sm" onClick={openModal}>
          + Create Receipt
        </button>
      </div>

      {/* Receipts Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="card-title mb-3">Receipts List</h5>
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Receipt No.</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No receipts found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Receipt Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Receipt</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <form className="row g-3">
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Receipt No."
                      name="number"
                    />
                  </div>
                  <div className="col-md-3">
                    <input type="date" className="form-control" name="date" />
                  </div>
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Customer"
                      name="customer"
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Amount"
                      name="amount"
                    />
                  </div>
                  <div className="col-md-1">
                    <select className="form-select" name="status">
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="col-12 text-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
