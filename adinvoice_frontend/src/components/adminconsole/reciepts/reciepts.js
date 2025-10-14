"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Eye, Download, Search, Filter, Plus } from "lucide-react";

export default function ReceiptsPage() {
  const [showModal, setShowModal] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [formData, setFormData] = useState({
    number: "",
    date: new Date().toISOString().split('T')[0],
    customer: "",
    amount: "",
    status: "Paid",
    description: ""
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleReceipts = [
      {
        id: 1,
        number: "R-001",
        date: "2024-01-15",
        customer: "John Smith",
        amount: "2500.00",
        status: "Paid",
        description: "Website Development"
      },
      {
        id: 2,
        number: "R-002",
        date: "2024-01-10",
        customer: "Sarah Johnson",
        amount: "1800.00",
        status: "Pending",
        description: "Consulting Services"
      }
    ];
    setReceipts(sampleReceipts);
  }, []);

  // Modal handlers
  const openModal = (receipt = null) => {
    if (receipt) {
      setEditingReceipt(receipt);
      setFormData(receipt);
    } else {
      setEditingReceipt(null);
      setFormData({
        number: `R-${String(receipts.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        customer: "",
        amount: "",
        status: "Paid",
        description: ""
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReceipt(null);
    setFormData({
      number: "",
      date: new Date().toISOString().split('T')[0],
      customer: "",
      amount: "",
      status: "Paid",
      description: ""
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingReceipt) {
      // Update existing receipt
      setReceipts(receipts.map(r => 
        r.id === editingReceipt.id ? { ...formData, id: editingReceipt.id } : r
      ));
    } else {
      // Add new receipt
      const newReceipt = {
        ...formData,
        id: receipts.length > 0 ? Math.max(...receipts.map(r => r.id)) + 1 : 1
      };
      setReceipts([...receipts, newReceipt]);
    }
    closeModal();
  };

  // Delete receipt
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      setReceipts(receipts.filter(r => r.id !== id));
    }
  };

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0);
  const paidAmount = filteredReceipts
    .filter(r => r.status === "Paid")
    .reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0);

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="row align-items-center mb-4">
        <div className="col">
          <h1 className="h3 fw-bold text-dark mb-1">🧾 Receipts Management</h1>
          <p className="text-muted mb-0">Manage and track all your receipts in one place</p>
        </div>
        <div className="col-auto">
          <button 
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={() => openModal()}
          >
            <Plus size={18} />
            New Receipt
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-2">Total Receipts</h6>
                  <h3 className="fw-bold mb-0">{filteredReceipts.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <div className="text-primary">🧾</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-2">Total Amount</h6>
                  <h3 className="fw-bold mb-0">₹{totalAmount.toLocaleString()}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <div className="text-success">💰</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-2">Paid Amount</h6>
                  <h3 className="fw-bold mb-0">₹{paidAmount.toLocaleString()}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <div className="text-info">✅</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search receipts by customer or receipt number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="col-md-3 text-end">
              <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                <Filter size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 fw-semibold text-muted small">RECEIPT NO.</th>
                  <th className="fw-semibold text-muted small">DATE</th>
                  <th className="fw-semibold text-muted small">CUSTOMER</th>
                  <th className="fw-semibold text-muted small">DESCRIPTION</th>
                  <th className="fw-semibold text-muted small text-end">AMOUNT (₹)</th>
                  <th className="fw-semibold text-muted small">STATUS</th>
                  <th className="fw-semibold text-muted small text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <div className="mb-3">📄</div>
                        <p className="mb-0">No receipts found</p>
                        <small>Create your first receipt to get started</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((receipt) => (
                    <tr key={receipt.id} className="border-bottom">
                      <td className="ps-4">
                        <div className="fw-semibold text-primary">{receipt.number}</div>
                      </td>
                      <td>
                        <div className="text-muted small">
                          {new Date(receipt.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{receipt.customer}</div>
                      </td>
                      <td>
                        <div className="text-muted small">{receipt.description}</div>
                      </td>
                      <td className="text-end">
                        <div className="fw-bold">₹{parseFloat(receipt.amount).toLocaleString()}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            receipt.status === "Paid" 
                              ? "bg-success bg-opacity-10 text-success" 
                              : "bg-warning bg-opacity-10 text-warning"
                          } rounded-pill px-3 py-2`}
                        >
                          {receipt.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button 
                            className="btn btn-outline-primary border-end-0"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className="btn btn-outline-secondary border-end-0"
                            title="Edit"
                            onClick={() => openModal(receipt)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            className="btn btn-outline-info border-end-0"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            title="Delete"
                            onClick={() => handleDelete(receipt.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Receipt Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-light border-0 py-4">
                <h5 className="modal-title fw-bold">
                  {editingReceipt ? "Edit Receipt" : "Create New Receipt"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Receipt Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="number"
                        placeholder="R-001"
                        value={formData.number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Customer Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customer"
                        placeholder="Enter customer name"
                        value={formData.customer}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        placeholder="Enter receipt description"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Amount (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="amount"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 py-4">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 shadow-sm"
                  >
                    {editingReceipt ? "Update Receipt" : "Create Receipt"}
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