"use client";
import React, { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([
    { id: 1, employee: "Alice Smith", salary: 3000, date: "2025-09-10", status: "Paid" },
    { id: 2, employee: "Bob Johnson", salary: 2500, date: "2025-09-11", status: "Pending" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [formData, setFormData] = useState({
    employee: "",
    salary: 0,
    date: "",
    status: "Pending",
  });

  // Open modal for add or edit
  const openModal = (payroll = null) => {
    if (payroll) {
      setEditingPayroll(payroll);
      setFormData({ ...payroll });
    } else {
      setEditingPayroll(null);
      setFormData({ employee: "", salary: 0, date: "", status: "Pending" });
    }
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => setModalOpen(false);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPayroll) {
      setPayrolls(
        payrolls.map((p) =>
          p.id === editingPayroll.id ? { ...formData, id: p.id } : p
        )
      );
    } else {
      const newPayroll = { id: payrolls.length + 1, ...formData };
      setPayrolls([...payrolls, newPayroll]);
    }
    closeModal();
  };

  // Delete payroll
  const handleDelete = (id) => setPayrolls(payrolls.filter((p) => p.id !== id));

  return (
    <div className="card shadow border-0 p-4 my-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Payroll</h4>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
          <Plus size={16} /> Add Payroll
        </button>
      </div>

      {/* Payroll Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Salary ($)</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((payroll) => (
              <tr key={payroll.id}>
                <td>{payroll.id}</td>
                <td>{payroll.employee}</td>
                <td>{payroll.salary}</td>
                <td>{payroll.date}</td>
                <td>
                  <span
                    className={`badge ${
                      payroll.status === "Paid"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {payroll.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openModal(payroll)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(payroll.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPayroll ? "Edit Payroll" : "Add Payroll"}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Employee Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.employee}
                      onChange={(e) =>
                        setFormData({ ...formData, employee: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Salary</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPayroll ? "Save Changes" : "Add Payroll"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
