"use client";
import React, { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";

export default function Accounts() {
  const [accounts, setAccounts] = useState([
    { id: 1, name: "Main Account", type: "Checking", balance: 2500 },
    { id: 2, name: "Savings Account", type: "Savings", balance: 8000 },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Checking",
    balance: 0,
  });

  // Open modal for add or edit
  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance,
      });
    } else {
      setEditingAccount(null);
      setFormData({ name: "", type: "Checking", balance: 0 });
    }
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => setModalOpen(false);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAccount) {
      setAccounts(
        accounts.map((a) =>
          a.id === editingAccount.id ? { ...a, ...formData } : a
        )
      );
    } else {
      const newAccount = { id: accounts.length + 1, ...formData };
      setAccounts([...accounts, newAccount]);
    }
    closeModal();
  };

  // Delete account
  const handleDelete = (id) => setAccounts(accounts.filter((a) => a.id !== id));

  return (
    <div className="card shadow border-0 p-4 my-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Accounts</h4>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
          <Plus size={16} /> Add Account
        </button>
      </div>

      {/* Accounts Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Balance ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.name}</td>
                <td>{account.type}</td>
                <td>{account.balance}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openModal(account)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(account.id)}
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
                  {editingAccount ? "Edit Account" : "Add Account"}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Account Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Account Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="Checking">Checking</option>
                      <option value="Savings">Savings</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Balance</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.balance}
                      onChange={(e) =>
                        setFormData({ ...formData, balance: e.target.value })
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
                    {editingAccount ? "Save Changes" : "Add Account"}
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
