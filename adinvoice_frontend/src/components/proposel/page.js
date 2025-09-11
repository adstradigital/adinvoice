"use client";
import React, { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";

export default function InvoiceProposal() {
  const [proposals, setProposals] = useState([
    { id: 1, client: "John Doe", amount: 500, status: "Pending" },
    { id: 2, client: "Acme Corp", amount: 1200, status: "Approved" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [formData, setFormData] = useState({
    client: "",
    amount: "",
    status: "Pending",
  });

  // Open modal for add or edit
  const openModal = (proposal = null) => {
    if (proposal) {
      setEditingProposal(proposal);
      setFormData({
        client: proposal.client,
        amount: proposal.amount,
        status: proposal.status,
      });
    } else {
      setEditingProposal(null);
      setFormData({ client: "", amount: "", status: "Pending" });
    }
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProposal) {
      // Edit proposal
      setProposals(
        proposals.map((p) =>
          p.id === editingProposal.id ? { ...p, ...formData } : p
        )
      );
    } else {
      // Add new proposal
      const newProposal = {
        id: proposals.length + 1,
        ...formData,
      };
      setProposals([...proposals, newProposal]);
    }
    closeModal();
  };

  // Delete proposal
  const handleDelete = (id) => {
    setProposals(proposals.filter((p) => p.id !== id));
  };

  return (
    <div className="card shadow border-0 p-4 my-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Proposals</h4>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
          <Plus size={16} /> Add Proposal
        </button>
      </div>

      {/* Proposals Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.id}>
                <td>{proposal.id}</td>
                <td>{proposal.client}</td>
                <td>${proposal.amount}</td>
                <td>
                  <span
                    className={`badge ${
                      proposal.status === "Approved"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {proposal.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openModal(proposal)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(proposal.id)}
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
                  {editingProposal ? "Edit Proposal" : "Add Proposal"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Client Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.client}
                      onChange={(e) =>
                        setFormData({ ...formData, client: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
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
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProposal ? "Save Changes" : "Add Proposal"}
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
