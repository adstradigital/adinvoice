"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import "./merchant-management.css";

const API_URL = "http://127.0.0.1:8000/api/merchants/"; // replace with your actual endpoint

export default function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 📌 Fetch merchants from API
  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      // const response = await axios.get(API_URL);
      setMerchants(response.data); // expects array of merchants from API
    } catch (error) {
      console.error("Error fetching merchants:", error);
    }
  };

  // 📌 Add new merchant
  const handleAdd = async () => {
    try {
      const newMerchant = {
        name: `New Merchant ${Date.now()}`,
        email: `new${Date.now()}@merchant.com`,
        status: "Active",
      };
      await axios.post(API_URL, newMerchant);
      fetchMerchants(); // refresh list
    } catch (error) {
      console.error("Error adding merchant:", error);
    }
  };

  // 📌 Delete merchant
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      fetchMerchants(); // refresh list
    } catch (error) {
      console.error("Error deleting merchant:", error);
    }
  };

  // 📌 Edit merchant placeholder (you can add modal like user management)
  const handleEdit = async (merchant) => {
    // Open edit form or inline edit logic
    // Example: axios.put(`${API_URL}${merchant.id}/`, updatedData)
    console.log("Edit merchant:", merchant);
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
                <button className="edit-btn" onClick={() => handleEdit(merchant)}>
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
