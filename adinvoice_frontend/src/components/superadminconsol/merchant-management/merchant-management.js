"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import "./merchant-management.css";

const MERCHANT_API = "http://127.0.0.1:8000/api/users/merchants/";
const DELETE_API = "http://127.0.0.1:8000/api/users/delete-entrepreneur/"; // your new delete API endpoint

export default function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found!");
      return;
    }

    try {
      const res = await axios.get(MERCHANT_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Merchants Fetched:", res.data);
      setMerchants(res.data);
    } catch (error) {
      console.error("Failed to fetch merchants:", error);
    }
  };

  // ✅ Delete Merchant
  const handleDelete = async (userId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this merchant? This action cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Access token missing!");
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${DELETE_API}${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("🗑️ Merchant and tenant deleted successfully!");
      // Refresh the list after deletion
      fetchMerchants();
    } catch (error) {
      console.error("❌ Failed to delete merchant:", error);
      alert("Failed to delete merchant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMerchants = merchants.filter(
    (m) =>
      m.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="merchant-container">
      <h2>🏬 Merchant Management</h2>

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
      </div>

      <table className="merchant-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Merchant Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company Name</th>
            <th>Tenant Name</th>
            <th>Tenant DB</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMerchants.map((merchant, index) => (
            <tr key={merchant.id}>
              <td>{index + 1}</td>
              <td>{merchant.owner?.full_name || merchant.owner?.username || "N/A"}</td>
              <td>{merchant.owner?.email || "N/A"}</td>
              <td>{merchant.owner?.phone || "N/A"}</td>
              <td>{merchant.owner?.company_name || "N/A"}</td>
              <td>{merchant.name || "N/A"}</td>
              <td>{merchant.db_name || "N/A"}</td>
              <td>
                <span
                  className={`status-badge ${merchant.is_active ? "active" : "inactive"}`}
                >
                  {merchant.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(merchant.owner?.id)}
                  disabled={loading}
                >
                  <FaTrashAlt /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
