"use client";
import { useState } from "react";
import { FaSearch, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "./merchant-management.css";

export default function MerchantManagement() {
  const [merchants, setMerchants] = useState([
    { id: 1, name: "ABC Traders", email: "abc@traders.com", status: "Active" },
    { id: 2, name: "XYZ Mart", email: "xyz@mart.com", status: "Inactive" },
    { id: 3, name: "Global Store", email: "global@store.com", status: "Active" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Handle delete
  const handleDelete = (id) => {
    setMerchants(merchants.filter((merchant) => merchant.id !== id));
  };

  // Handle add merchant
  const handleAdd = () => {
    const newId = merchants.length + 1;
    const newMerchant = {
      id: newId,
      name: `New Merchant ${newId}`,
      email: `new${newId}@merchant.com`,
      status: "Active",
    };
    setMerchants([...merchants, newMerchant]);
  };

  // Filter merchants based on search term
  const filteredMerchants = merchants.filter(
    (merchant) =>
      merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="merchant-container">
      <h2>🏬 Merchant Management</h2>

      {/* Top bar */}
      <div className="merchant-actions">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={handleAdd}>
          <FaPlus /> Add Merchant
        </button>
      </div>

      {/* Table */}
      <table className="merchant-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Merchant Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMerchants.map((merchant, index) => (
            <tr key={merchant.id}>
              <td>{index + 1}</td>
              <td>{merchant.name}</td>
              <td>{merchant.email}</td>
              <td>
                <span
                  className={`status-badge ${
                    merchant.status === "Active" ? "active" : "inactive"
                  }`}
                >
                  {merchant.status}
                </span>
              </td>
              <td>
                <button className="edit-btn">
                  <FaEdit />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(merchant.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          {filteredMerchants.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                No merchants found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
