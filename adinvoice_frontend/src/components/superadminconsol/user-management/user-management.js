"use client";
import React, { useState, useEffect } from "react";
import "./user-management.css";
import { FaUserPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";

// Dummy API base (replace with your Django backend API URL)
const API_URL = "http://127.0.0.1:8000/api/users/";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ id: null, name: "", email: "", role: "Reader", status: "Active" });

  // 📌 Fetch Users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data); // assumes API returns a list of users
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // 📌 Open Add/Edit form
  const handleOpenForm = (user = null) => {
    if (user) {
      setFormData(user);
      setEditUser(user);
    } else {
      setFormData({ id: null, name: "", email: "", role: "Reader", status: "Active" });
      setEditUser(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // 📌 Save user (Add or Update)
  const handleSaveUser = async () => {
    try {
      if (editUser) {
        // Update user
        await axios.put(`${API_URL}${editUser.id}/`, formData);
      } else {
        // Add new user
        await axios.post(API_URL, formData);
      }
      fetchUsers(); // refresh list
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // 📌 Delete user
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      fetchUsers(); // refresh list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="user-grid">
        <div className="user-card">
          <h4>Total Users</h4>
          <p>{users.length}</p>
        </div>
        <div className="user-card">
          <h4>Active Users</h4>
          <p>{users.filter(u => u.status === "Active").length}</p>
        </div>
        <div className="user-card">
          <h4>Admins</h4>
          <p>{users.filter(u => u.role === "Admin").length}</p>
        </div>
        <div className="user-card">
          <h4>Pending Users</h4>
          <p>{users.filter(u => u.status === "Pending").length}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="user-table-card">
        <div className="user-table-header">
          <h3>👥 Manage Users</h3>
          <button className="add-btn" onClick={() => handleOpenForm()}>
            <FaUserPlus /> Add User
          </button>
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.status === "Active" && <span className="badge active"><FaCheckCircle /> Active</span>}
                  {user.status === "Inactive" && <span className="badge inactive"><FaTimesCircle /> Inactive</span>}
                  {user.status === "Pending" && <span className="badge pending">⏳ Pending</span>}
                </td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleOpenForm(user)}><FaEdit /></button>
                  <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editUser ? "Edit User" : "Add User"}</h3>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option>Admin</option>
              <option>Editor</option>
              <option>Author</option>
              <option>Reader</option>
            </select>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleSaveUser}>Save</button>
              <button onClick={handleCloseForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
