"use client";
import React, { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";

export default function Banking() {
  const [transactions, setTransactions] = useState([
    { id: 1, account: "Main Account", type: "Deposit", amount: 500, date: "2025-09-10" },
    { id: 2, account: "Savings Account", type: "Withdrawal", amount: 200, date: "2025-09-11" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    account: "",
    type: "Deposit",
    amount: 0,
    date: "",
  });

  // Open modal for add or edit
  const openModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({ ...transaction });
    } else {
      setEditingTransaction(null);
      setFormData({ account: "", type: "Deposit", amount: 0, date: "" });
    }
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => setModalOpen(false);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTransaction) {
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransaction.id ? { ...formData, id: t.id } : t
        )
      );
    } else {
      const newTransaction = { id: transactions.length + 1, ...formData };
      setTransactions([...transactions, newTransaction]);
    }
    closeModal();
  };

  // Delete transaction
  const handleDelete = (id) => setTransactions(transactions.filter((t) => t.id !== id));

  return (
    <div className="card shadow border-0 p-4 my-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Banking Transactions</h4>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Transactions Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Account</th>
              <th>Type</th>
              <th>Amount ($)</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.account}</td>
                <td>{transaction.type}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.date}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openModal(transaction)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(transaction.id)}
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
                  {editingTransaction ? "Edit Transaction" : "Add Transaction"}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Account</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.account}
                      onChange={(e) =>
                        setFormData({ ...formData, account: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="Deposit">Deposit</option>
                      <option value="Withdrawal">Withdrawal</option>
                    </select>
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTransaction ? "Save Changes" : "Add Transaction"}
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
