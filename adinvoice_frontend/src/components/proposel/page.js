"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus } from "lucide-react";

export default function InvoiceProposal() {
  const [proposals, setProposals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    email: "",
    amount: "",
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    description: "",
    status: "Pending",
  });

  // Fetch proposals from API (GET)
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await axios.get("https://dummyjson.com/carts"); // Replace with your backend API
        const dummyProposals = response.data.carts.slice(0, 5).map((item, index) => ({
          id: index + 1,
          title: `Proposal ${index + 1}`,
          client: `Client ${index + 1}`,
          email: `client${index + 1}@example.com`,
          amount: item.discountedTotal,
          currency: "USD",
          date: new Date().toISOString().split("T")[0],
          dueDate: new Date().toISOString().split("T")[0],
          description: "This is a dummy proposal description.",
          status: index % 2 === 0 ? "Pending" : "Approved",
        }));
        setProposals(dummyProposals);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      }
    };

    fetchProposals();
  }, []);

  // Open modal for add or edit
  const openModal = (proposal = null) => {
    if (proposal) {
      setEditingProposal(proposal);
      setFormData(proposal);
    } else {
      setEditingProposal(null);
      setFormData({
        title: "",
        client: "",
        email: "",
        amount: "",
        currency: "USD",
        date: new Date().toISOString().split("T")[0],
        dueDate: "",
        description: "",
        status: "Pending",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // Submit form (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProposal) {
        // Update locally for now
        setProposals(
          proposals.map((p) =>
            p.id === editingProposal.id ? { ...formData } : p
          )
        );
      } else {
        // POST request to backend (dummy API for now)
        await axios.post("https://dummyjson.com/carts/add", formData); // Replace with your backend
        const newProposal = { id: proposals.length + 1, ...formData };
        setProposals([...proposals, newProposal]);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving proposal:", err);
    }
  };

  // Delete proposal
  const handleDelete = (id) => {
    setProposals(proposals.filter((p) => p.id !== id));
  };

  return (
    <div className="card shadow border-0 p-4 my-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Invoice Proposals</h4>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
          <Plus size={16} /> Add Proposal
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Client</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{p.client}</td>
                <td>{p.email}</td>
                <td>{p.amount}</td>
                <td>{p.currency}</td>
                <td>{p.date}</td>
                <td>{p.dueDate}</td>
                <td>
                  <span
                    className={`badge ${
                      p.status === "Approved"
                        ? "bg-success"
                        : p.status === "Rejected"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openModal(p)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(p.id)}
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
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
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Form fields */}
                    <div className="col-md-6">
                      <label className="form-label">Proposal Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
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
                    <div className="col-md-6">
                      <label className="form-label">Client Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
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
                    <div className="col-md-3">
                      <label className="form-label">Currency</label>
                      <select
                        className="form-select"
                        value={formData.currency}
                        onChange={(e) =>
                          setFormData({ ...formData, currency: e.target.value })
                        }
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Proposal Date</label>
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
                    <div className="col-md-6">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dueDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description / Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                      ></textarea>
                    </div>
                    <div className="col-md-6">
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
                        <option value="Rejected">Rejected</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
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
